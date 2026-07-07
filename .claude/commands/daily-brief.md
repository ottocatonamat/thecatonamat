---
description: Generate today's AI-in-Finance daily brief from collected items (phone-friendly fallback when no API key is configured in Actions)
---

Generate today's AI-in-Finance daily brief. Follow these steps exactly:

1. Determine today's date in UTC (`date -u +%F`). If the user passed a date as an argument, use that instead.
2. If `data/items/<date>.jsonl` does not exist or is empty, run `python pipeline/collect.py --date <date>` first (install deps with `pip install -r requirements.txt` if needed).
3. Read `prompts/daily_brief.md` — it is the report template and contains the full output-format and sourcing rules. Build the report exactly as that prompt specifies, using:
   - the items in `data/items/<date>.jsonl` (rank them the same way `pipeline/synthesize.py` does: asset-management spotlight items first, then feed weight, then recency; cap ~110 items, max 4 per publisher),
   - the most recent prior report in `reports/daily/` for the "Since yesterday" section.
4. **Never invent sources, figures, or quotations** — cite only items present in the JSONL file, with their real URLs.
5. Write the report to `reports/daily/<date>.md`.
6. Run `python pipeline/render.py --date <date>` to produce the HTML and refresh the index.
7. Commit `data/`, `reports/`, and `docs/` with message `Daily brief <date> (manual)` and push to the current branch.
8. Reply with a 3-bullet summary of the brief's top developments and the report file path.
