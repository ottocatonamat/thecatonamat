// Tiny JSON-file store. One file, atomic-ish writes, no native deps.
// Swap for SQLite/Postgres if the collection outgrows a few thousand recipes.

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data");
const DB_PATH = path.join(DATA_DIR, "recipes.json");

let cache = null;

async function load() {
  if (cache) return cache;
  try {
    cache = JSON.parse(await readFile(DB_PATH, "utf8"));
  } catch {
    cache = [];
  }
  return cache;
}

async function persist() {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_PATH}.tmp`;
  await writeFile(tmp, JSON.stringify(cache, null, 2));
  await rename(tmp, DB_PATH);
}

export async function listRecipes({ q, tag } = {}) {
  let recipes = await load();
  if (tag) recipes = recipes.filter((r) => r.tags?.includes(tag));
  if (q) {
    const needle = q.toLowerCase();
    recipes = recipes.filter((r) =>
      [
        r.title,
        r.description,
        r.cuisine,
        ...(r.tags ?? []),
        ...(r.ingredients ?? []).map((i) => i.item),
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }
  return [...recipes].sort((a, b) => b.saved_at.localeCompare(a.saved_at));
}

export async function getRecipe(id) {
  return (await load()).find((r) => r.id === id) ?? null;
}

export async function findBySourceUrl(url) {
  return (await load()).find((r) => r.source_url === url) ?? null;
}

export async function saveRecipe(recipe) {
  await load();
  const record = { id: randomUUID(), saved_at: new Date().toISOString(), ...recipe };
  cache.push(record);
  await persist();
  return record;
}

export async function deleteRecipe(id) {
  await load();
  const before = cache.length;
  cache = cache.filter((r) => r.id !== id);
  if (cache.length === before) return false;
  await persist();
  return true;
}

export async function allTags() {
  const recipes = await load();
  const counts = new Map();
  for (const r of recipes) for (const t of r.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }));
}
