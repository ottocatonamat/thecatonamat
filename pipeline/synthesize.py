"""Generate the daily AI-in-Finance brief from collected items using Claude.

Reads data/items/YYYY-MM-DD.jsonl, ranks and caps the items, builds the prompt
from prompts/daily_brief.md, calls the Claude API, and writes
reports/daily/YYYY-MM-DD.md.

Degrades gracefully: if no ANTHROPIC_API_KEY is available the script exits 0
with a notice so the collection-only workflow still succeeds (generate the
report from your phone with /daily-brief instead).

Usage:
    python pipeline/synthesize.py [--date YYYY-MM-DD]
"""

import argparse
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
from utils import CONFIG_DIR, ITEMS_DIR, PROMPTS_DIR, REPORTS_DIR, setup_logging

log = setup_logging("synthesize")

MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-4-8")
MAX_TOKENS = int(os.environ.get("CLAUDE_MAX_TOKENS", "16000"))


def load_items(date: str) -> list[dict]:
    path = ITEMS_DIR / f"{date}.jsonl"
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


def rank_and_cap(items: list[dict]) -> list[dict]:
    """Prioritize spotlight + high-weight items, cap per publisher and total."""
    limits = yaml.safe_load((CONFIG_DIR / "topics.yaml").read_text()).get("limits", {})
    max_per_pub = limits.get("max_items_per_publisher", 4)
    max_total = limits.get("max_items_total", 110)

    def score(item):
        return (item.get("am_spotlight", False), item.get("weight", 1),
                item.get("published_at") or "")

    ranked, per_pub = [], {}
    for item in sorted(items, key=score, reverse=True):
        pub = item.get("publisher", "?")
        if per_pub.get(pub, 0) >= max_per_pub:
            continue
        per_pub[pub] = per_pub.get(pub, 0) + 1
        ranked.append(item)
        if len(ranked) >= max_total:
            break
    return ranked


def items_block(items: list[dict]) -> str:
    lines = []
    for i, item in enumerate(items, 1):
        lines.append(json.dumps({
            "n": i,
            "title": item["title"],
            "url": item["url"],
            "publisher": item.get("publisher"),
            "published_at": item.get("published_at"),
            "retrieved_at": item.get("retrieved_at"),
            "category_hint": item.get("category_hint"),
            "region_hint": item.get("region_hint"),
            "am_spotlight": item.get("am_spotlight", False),
            "summary": item.get("summary", "")[:400],
        }, ensure_ascii=False))
    return "\n".join(lines)


def previous_report(date: str) -> tuple[str, str]:
    """Return (date, text) of the most recent prior report within 7 days."""
    day = datetime.strptime(date, "%Y-%m-%d")
    for back in range(1, 8):
        prev = (day - timedelta(days=back)).strftime("%Y-%m-%d")
        path = REPORTS_DIR / f"{prev}.md"
        if path.exists():
            return prev, path.read_text()[:12000]
    return "", ""


def build_prompt(date: str, items: list[dict]) -> str:
    template = (PROMPTS_DIR / "daily_brief.md").read_text()
    prev_date, prev_text = previous_report(date)
    weekday = datetime.strptime(date, "%Y-%m-%d").strftime("%A")
    return (template
            .replace("{{DATE}}", date)
            .replace("{{WEEKDAY}}", weekday)
            .replace("{{ITEM_COUNT}}", str(len(items)))
            .replace("{{ITEMS_JSONL}}", items_block(items))
            .replace("{{PREV_DATE}}", prev_date or "none available")
            .replace("{{PREV_REPORT}}", prev_text or "(no previous report exists yet)"))


def write_stub(date: str, reason: str) -> Path:
    out = REPORTS_DIR / f"{date}.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(
        f"# AI in Finance — Daily Brief — {date}\n\n"
        f"_No report generated: {reason}_\n"
    )
    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=datetime.now(timezone.utc).strftime("%Y-%m-%d"))
    args = parser.parse_args()
    date = args.date

    out_path = REPORTS_DIR / f"{date}.md"

    items = rank_and_cap(load_items(date))
    if not items:
        log.warning("no items collected for %s — writing stub report", date)
        write_stub(date, "no relevant items were collected today")
        return

    if not os.environ.get("ANTHROPIC_API_KEY"):
        log.warning("ANTHROPIC_API_KEY not set — skipping synthesis. "
                    "Run /daily-brief from Claude Code to write the report instead.")
        return

    import anthropic

    prompt = build_prompt(date, items)
    log.info("synthesizing %s: %d items, model %s", date, len(items), MODEL)

    client = anthropic.Anthropic(max_retries=3)
    try:
        with client.messages.stream(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            thinking={"type": "adaptive"},
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            message = stream.get_final_message()
    except anthropic.APIStatusError as exc:
        log.error("Claude API error %s: %s — skipping synthesis so collected "
                  "items still commit. Generate the report with /daily-brief "
                  "from Claude Code instead.", exc.status_code, exc.message)
        return
    except anthropic.APIConnectionError:
        log.error("network error reaching the Claude API — skipping synthesis "
                  "so collected items still commit")
        return

    if message.stop_reason == "refusal":
        log.error("model refused the request — leaving no report for %s", date)
        return

    report = "".join(b.text for b in message.content if b.type == "text").strip()
    if message.stop_reason == "max_tokens":
        report += "\n\n> ⚠️ Report truncated at the output-token limit."

    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(report + "\n")

    usage = message.usage
    cost = (usage.input_tokens * 5 + usage.output_tokens * 25) / 1_000_000
    log.info("wrote %s (in=%d out=%d tokens, ~$%.2f)",
             out_path, usage.input_tokens, usage.output_tokens, cost)


if __name__ == "__main__":
    main()
