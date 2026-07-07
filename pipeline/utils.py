"""Shared helpers: logging, HTTP with retries, URL normalization, hashing."""

import hashlib
import json
import logging
import time
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

import requests

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
ITEMS_DIR = DATA_DIR / "items"
REPORTS_DIR = ROOT / "reports" / "daily"
DOCS_DIR = ROOT / "docs"
CONFIG_DIR = ROOT / "config"
PROMPTS_DIR = ROOT / "prompts"

USER_AGENT = (
    "Mozilla/5.0 (compatible; ai-finance-brief/1.0; "
    "+https://github.com/ottocatonamat/thecatonamat)"
)

TRACKING_PARAMS = {
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "utm_id", "gclid", "fbclid", "mc_cid", "mc_eid", "ref", "cmpid", "guccounter",
}


def setup_logging(name: str) -> logging.Logger:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)-7s %(name)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    return logging.getLogger(name)


def http_get(url: str, *, timeout: int = 20, retries: int = 3,
             logger: logging.Logger | None = None) -> bytes | None:
    """GET with exponential backoff. Returns body bytes, or None on failure.

    A single dead feed must never kill the run, so all errors are swallowed
    after the final retry and reported to the caller as None.
    """
    delay = 2.0
    for attempt in range(1, retries + 1):
        try:
            resp = requests.get(url, timeout=timeout,
                                headers={"User-Agent": USER_AGENT})
            if resp.status_code == 200:
                return resp.content
            if resp.status_code in (429, 500, 502, 503, 504) and attempt < retries:
                retry_after = resp.headers.get("retry-after")
                sleep_for = float(retry_after) if retry_after and retry_after.isdigit() else delay
                if logger:
                    logger.warning("HTTP %s from %s, retry %d/%d in %.0fs",
                                   resp.status_code, url, attempt, retries, sleep_for)
                time.sleep(sleep_for)
                delay *= 2
                continue
            if logger:
                logger.warning("HTTP %s from %s, giving up", resp.status_code, url)
            return None
        except requests.RequestException as exc:
            if attempt < retries:
                if logger:
                    logger.warning("error fetching %s (%s), retry %d/%d in %.0fs",
                                   url, exc.__class__.__name__, attempt, retries, delay)
                time.sleep(delay)
                delay *= 2
            else:
                if logger:
                    logger.warning("error fetching %s (%s), giving up", url, exc)
                return None
    return None


def canonical_url(url: str) -> str:
    """Normalize a URL for dedup: strip tracking params, fragment, trailing slash."""
    try:
        parts = urlparse(url.strip())
        query = [(k, v) for k, v in parse_qsl(parts.query)
                 if k.lower() not in TRACKING_PARAMS]
        path = parts.path.rstrip("/") or "/"
        return urlunparse((parts.scheme.lower(), parts.netloc.lower(), path,
                           parts.params, urlencode(query), ""))
    except ValueError:
        return url.strip()


def sha1(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8", errors="replace")).hexdigest()


def title_fingerprint(title: str) -> str:
    """Hash of a normalized title, so syndicated copies of a story dedupe."""
    normalized = "".join(c.lower() for c in title if c.isalnum() or c.isspace())
    return sha1(" ".join(normalized.split()))


def load_json(path: Path, default):
    if path.exists():
        try:
            return json.loads(path.read_text())
        except json.JSONDecodeError:
            return default
    return default


def save_json(path: Path, obj) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, indent=1, sort_keys=True))
