// Source-content gathering: given a URL, pull out the best raw text we can
// before handing it to Claude for normalization.
//
// Strategy, in order of reliability:
//   1. schema.org/Recipe JSON-LD  (most food blogs — structured, deterministic)
//   2. Platform oEmbed endpoints  (YouTube, TikTok — title/caption without auth)
//   3. OpenGraph meta tags        (og:title / og:description — Instagram sometimes)
//   4. Stripped page text         (last resort for arbitrary pages)

import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_BODY_BYTES = 3_000_000;
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function isPrivateIp(ip) {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    return v === "::1" || v.startsWith("fe80:") || v.startsWith("fc") || v.startsWith("fd");
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

async function assertPublicHost(url) {
  const { hostname, protocol } = new URL(url);
  if (protocol !== "http:" && protocol !== "https:") {
    throw new Error(`Unsupported protocol: ${protocol}`);
  }
  if (isIP(hostname)) {
    if (isPrivateIp(hostname)) throw new Error("Refusing to fetch a private address");
    return;
  }
  const { address } = await lookup(hostname);
  if (isPrivateIp(address)) throw new Error("Refusing to fetch a private address");
}

async function fetchText(url, { headers = {} } = {}) {
  await assertPublicHost(url);
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "text/html,application/json;q=0.9,*/*;q=0.8", ...headers },
    redirect: "follow",
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  const reader = res.body.getReader();
  const chunks = [];
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > MAX_BODY_BYTES) {
      reader.cancel();
      break;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

export function detectPlatform(url) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (host.includes("instagram.com")) return "instagram";
  if (host.includes("tiktok.com")) return "tiktok";
  if (host.includes("youtube.com") || host === "youtu.be") return "youtube";
  if (host.includes("pinterest.")) return "pinterest";
  if (host.includes("facebook.com")) return "facebook";
  return "web";
}

// --- 1. schema.org/Recipe JSON-LD ------------------------------------------

function* iterJsonLdObjects(node) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const item of node) yield* iterJsonLdObjects(item);
    return;
  }
  yield node;
  if (node["@graph"]) yield* iterJsonLdObjects(node["@graph"]);
}

export function extractJsonLdRecipe(html) {
  const scripts = html.matchAll(
    /<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const [, raw] of scripts) {
    let parsed;
    try {
      parsed = JSON.parse(raw.trim());
    } catch {
      continue;
    }
    for (const obj of iterJsonLdObjects(parsed)) {
      const type = [].concat(obj["@type"] ?? []);
      if (type.some((t) => String(t).toLowerCase() === "recipe")) return obj;
    }
  }
  return null;
}

// --- 2. oEmbed --------------------------------------------------------------

export async function fetchOEmbed(url, platform) {
  const endpoints = {
    youtube: `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
    tiktok: `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
  };
  const endpoint = endpoints[platform];
  if (!endpoint) return null;
  try {
    return JSON.parse(await fetchText(endpoint));
  } catch {
    return null;
  }
}

// --- 3 & 4. Meta tags + stripped body text ---------------------------------

export function extractMeta(html) {
  const meta = {};
  const tags = html.matchAll(/<meta\s+[^>]*>/gi);
  for (const [tag] of tags) {
    const prop = tag.match(/(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1];
    const content = tag.match(/content\s*=\s*["']([^"']*)["']/i)?.[1];
    if (prop && content) meta[prop.toLowerCase()] = decodeEntities(content);
  }
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  if (title) meta.title = decodeEntities(title.trim());
  return meta;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)));
}

export function stripHtmlToText(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<(?:br|\/p|\/div|\/li|\/h[1-6])[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// --- Orchestrator -----------------------------------------------------------

const MAX_CLAUDE_INPUT_CHARS = 60_000;

/**
 * Gather the best available raw material for a URL. Returns
 * { platform, rawText, image, needsCaption } — rawText is what we send to
 * Claude; needsCaption is true when the platform blocked us and the user
 * should paste the caption manually.
 */
export async function gatherSource(url) {
  const platform = detectPlatform(url);
  const parts = [];
  let image = null;

  const oembed = await fetchOEmbed(url, platform);
  if (oembed) {
    if (oembed.title) parts.push(`Post title/caption: ${oembed.title}`);
    if (oembed.author_name) parts.push(`Author: ${oembed.author_name}`);
    image = oembed.thumbnail_url ?? null;
  }

  let html = null;
  try {
    html = await fetchText(url);
  } catch {
    // Login walls / bot blocks (common on Instagram) land here.
  }

  if (html) {
    const jsonLd = extractJsonLdRecipe(html);
    if (jsonLd) {
      parts.push(`Structured recipe data (schema.org JSON-LD):\n${JSON.stringify(jsonLd).slice(0, 30_000)}`);
      const img = jsonLd.image;
      image = image ?? (typeof img === "string" ? img : img?.url ?? (Array.isArray(img) ? img[0]?.url ?? img[0] : null));
    }
    const meta = extractMeta(html);
    if (meta["og:title"]) parts.push(`Page title: ${meta["og:title"]}`);
    else if (meta.title) parts.push(`Page title: ${meta.title}`);
    if (meta["og:description"]) parts.push(`Page description: ${meta["og:description"]}`);
    image = image ?? meta["og:image"] ?? null;
    if (!jsonLd) {
      const body = stripHtmlToText(html);
      if (body.length > 200) parts.push(`Page text:\n${body}`);
    }
  }

  const rawText = parts.join("\n\n").slice(0, MAX_CLAUDE_INPUT_CHARS);
  // Heuristic: if all we got is a bare title (or nothing), the caption with the
  // actual recipe is behind a login wall — ask the user to paste it.
  const needsCaption = rawText.length < 300;
  return { platform, rawText, image, needsCaption };
}
