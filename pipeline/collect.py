"""Collect AI-in-finance news items from all configured feeds.

Fetches every source in config/sources.yaml, normalizes entries, filters for
AI+finance relevance and recency, dedupes against a rolling seen-index, and
writes data/items/YYYY-MM-DD.jsonl (merging with anything already collected
for that date). Safe to run multiple times per day.

Usage:
    python pipeline/collect.py [--date YYYY-MM-DD] [--recency-days N]
"""

import argparse
import json
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

import feedparser
import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
from utils import (CONFIG_DIR, DATA_DIR, ITEMS_DIR, canonical_url, http_get,
                   load_json, save_json, setup_logging, sha1,
                   title_fingerprint)

log = setup_logging("collect")


def load_configs():
    sources = yaml.safe_load((CONFIG_DIR / "sources.yaml").read_text())["sources"]
    topics = yaml.safe_load((CONFIG_DIR / "topics.yaml").read_text())
    return sources, topics


def entry_timestamp(entry) -> datetime | None:
    for attr in ("published_parsed", "updated_parsed"):
        parsed = getattr(entry, attr, None)
        if parsed:
            return datetime.fromtimestamp(time.mktime(parsed), tz=timezone.utc)
    return None


def entry_publisher(entry, source_name: str) -> str:
    # Google News puts the real publisher in <source>; other feeds use the feed name.
    source_tag = getattr(entry, "source", None)
    if source_tag and getattr(source_tag, "title", None):
        return source_tag.title
    return source_name


def clean_summary(entry) -> str:
    import re
    raw = getattr(entry, "summary", "") or ""
    text = re.sub(r"<[^>]+>", " ", raw)          # strip HTML tags
    text = " ".join(text.split())
    return text[:600]


def is_relevant(item: dict, topics: dict, assume_relevant: bool) -> bool:
    haystack = f" {item['title']} {item['summary']} ".lower()
    for kw in topics.get("exclude_keywords", []):
        if kw.lower() in item["title"].lower():
            return False
    if assume_relevant:
        return True
    has_ai = any(kw.lower() in haystack for kw in topics["ai_keywords"])
    has_fin = any(kw.lower() in haystack for kw in topics["finance_keywords"])
    return has_ai and has_fin


def am_boost(item: dict, topics: dict) -> bool:
    haystack = f"{item['title']} {item['summary']}".lower()
    return any(kw.lower() in haystack
               for kw in topics.get("asset_management_keywords", []))


def collect(run_date: str, recency_days: int) -> dict:
    sources, topics = load_configs()
    limits = topics.get("limits", {})
    recency_days = recency_days or limits.get("recency_days", 2)
    cutoff = datetime.now(timezone.utc) - timedelta(days=recency_days)

    seen_path = DATA_DIR / "seen.json"
    seen = load_json(seen_path, {})   # hash -> ISO date first seen

    out_path = ITEMS_DIR / f"{run_date}.jsonl"
    existing_items, existing_hashes = [], set()
    if out_path.exists():
        for line in out_path.read_text().splitlines():
            if line.strip():
                item = json.loads(line)
                existing_items.append(item)
                existing_hashes.add(item["id"])

    new_items, stats = [], {"feeds_ok": 0, "feeds_failed": 0, "entries_seen": 0,
                            "kept": 0, "dup": 0, "irrelevant": 0, "stale": 0}
    run_title_fps = {i.get("title_fp") for i in existing_items}

    for src in sources:
        body = http_get(src["url"], logger=log)
        if body is None:
            stats["feeds_failed"] += 1
            log.warning("FAILED feed: %s", src["name"])
            continue
        feed = feedparser.parse(body)
        if feed.bozo and not feed.entries:
            stats["feeds_failed"] += 1
            log.warning("UNPARSEABLE feed: %s", src["name"])
            continue
        stats["feeds_ok"] += 1

        kept_here = 0
        for entry in feed.entries:
            stats["entries_seen"] += 1
            link = getattr(entry, "link", None)
            title = (getattr(entry, "title", "") or "").strip()
            if not link or not title:
                continue

            ts = entry_timestamp(entry)
            if ts is not None and ts < cutoff:
                stats["stale"] += 1
                continue

            curl = canonical_url(link)
            item_id = sha1(curl)
            title_fp = title_fingerprint(title)
            if (item_id in seen or item_id in existing_hashes
                    or title_fp in run_title_fps):
                stats["dup"] += 1
                continue

            item = {
                "id": item_id,
                "title": title,
                "url": link,
                "canonical_url": curl,
                "title_fp": title_fp,
                "summary": clean_summary(entry),
                "publisher": entry_publisher(entry, src["name"]),
                "published_at": ts.isoformat() if ts else None,
                "retrieved_at": datetime.now(timezone.utc).isoformat(),
                "source_feed": src["name"],
                "category_hint": src.get("category_hint", "other"),
                "region_hint": src.get("region_hint", "Global"),
                "weight": src.get("weight", 1),
            }
            if not is_relevant(item, topics, src.get("assume_relevant", False)):
                stats["irrelevant"] += 1
                continue

            item["am_spotlight"] = am_boost(item, topics)
            new_items.append(item)
            existing_hashes.add(item_id)
            run_title_fps.add(title_fp)
            seen[item_id] = run_date
            kept_here += 1
            stats["kept"] += 1
        log.info("%-32s kept %d", src["name"], kept_here)

    # Persist merged day file.
    all_items = existing_items + new_items
    ITEMS_DIR.mkdir(parents=True, exist_ok=True)
    with out_path.open("w") as fh:
        for item in all_items:
            fh.write(json.dumps(item, ensure_ascii=False) + "\n")

    # Prune the seen-index to the retention window.
    retention = limits.get("seen_retention_days", 45)
    keep_after = (datetime.now(timezone.utc) - timedelta(days=retention)).strftime("%Y-%m-%d")
    seen = {h: d for h, d in seen.items() if d >= keep_after}
    save_json(seen_path, seen)

    state = load_json(DATA_DIR / "state.json", {})
    state[run_date] = {**stats, "total_items_today": len(all_items),
                       "last_run": datetime.now(timezone.utc).isoformat()}
    state = dict(sorted(state.items())[-60:])   # keep 60 days of run stats
    save_json(DATA_DIR / "state.json", state)

    log.info("done: %s", stats)
    log.info("items for %s: %d (file %s)", run_date, len(all_items), out_path)
    return stats


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    parser.add_argument("--recency-days", type=int, default=None)
    args = parser.parse_args()
    stats = collect(args.date, args.recency_days)
    # Non-zero exit only if literally every feed failed (likely a network outage).
    if stats["feeds_ok"] == 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
