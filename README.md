# thecatonamat

This repo currently hosts two independent features:

1. **[AI in Finance — Daily Brief](#ai-in-finance--daily-brief)** — an automated daily
   intelligence pipeline (Python + GitHub Actions).
2. **[Daily Inspiration Feed](#daily-inspiration-feed)** — a curated, daily-rotating
   inspiration web app (Vite + React + TypeScript).

---

# AI in Finance — Daily Brief

Automated daily intelligence on artificial intelligence across **asset management** (spotlight sector) and **global finance** — banking, markets, fintech, payments, insurance, regulation, funding, and research.

Every day at **08:00 Singapore time (00:00 UTC)** the pipeline collects from ~20 free sources (regulators, arXiv, trade media, Google News topical sweeps), dedupes and filters, has Claude write a ~1,500–2,000-word decision-oriented brief with traceable citations, and publishes Markdown + HTML.

## Reading the brief (phone)

- **GitHub Pages** (after one-time setup below): `https://ottocatonamat.github.io/thecatonamat/` — bookmark it.
- Or browse `reports/daily/` in the GitHub app.

## One-time setup

1. **Merge this branch to `master`.** Scheduled GitHub Actions only run on the default branch.
2. **Add the API key** (for fully automated briefs): repo → Settings → Secrets and variables → Actions → New repository secret → name `ANTHROPIC_API_KEY`, value from <https://platform.claude.com>. *Skip this if you prefer the phone-triggered path below — collection still runs daily without it.*
3. **Enable GitHub Pages**: repo → Settings → Pages → Source: *Deploy from a branch* → branch `master`, folder `/docs`.

## Daily operation

Fully hands-off once set up. Useful commands:

| What | How |
|---|---|
| Run the pipeline now | GitHub app / web → Actions → **daily-brief** → *Run workflow* |
| Generate today's brief from your phone (no API key needed) | Open Claude Code on this repo and type `/daily-brief` |
| Change the run time | Edit the `cron:` line in `.github/workflows/daily-brief.yml` (UTC) |
| Add/remove sources | Edit `config/sources.yaml` |
| Tune relevance keywords | Edit `config/topics.yaml` |
| Change report style/sections | Edit `prompts/daily_brief.md` |

## Architecture

```
config/sources.yaml      feed registry (regulators, arXiv, media, Google News sweeps)
config/topics.yaml       relevance keywords, spotlight boost, caps
pipeline/collect.py      fetch → normalize → filter → dedupe → data/items/DATE.jsonl
pipeline/synthesize.py   rank items → Claude (claude-opus-4-8) → reports/daily/DATE.md
pipeline/render.py       Markdown → HTML in docs/ + index page
prompts/daily_brief.md   report template + sourcing rules (used by both paths)
data/seen.json           45-day rolling dedup index
data/state.json          per-run stats (feeds ok/failed, items kept)
.claude/commands/daily-brief.md   phone fallback slash command
.github/workflows/daily-brief.yml daily 08:00 UTC run
```

Every item carries: source URL, publisher, publication date, retrieval date, region hint, category hint, and an asset-management spotlight flag. The brief cites items by number with real URLs, separates verified facts from analysis, and flags low-confidence claims. Failures degrade gracefully: a dead feed is skipped, a missing API key skips synthesis only, and zero collected items produces a stub report rather than a crash.

## Cost

Collection is free. Synthesis uses `claude-opus-4-8` ($5/$25 per MTok): typically ~$0.30–0.60 per daily brief ≈ **$10–18/month**. Set `CLAUDE_MAX_TOKENS` or a cheaper `CLAUDE_MODEL` env var to trade quality for cost.

## Local run

```bash
pip install -r requirements.txt
python pipeline/collect.py
ANTHROPIC_API_KEY=sk-ant-... python pipeline/synthesize.py
python pipeline/render.py
```

## Assumptions & limits

- The run fires at **08:00 Singapore time (SGT = UTC+8, no DST), i.e. cron `0 0 * * *` UTC** — GitHub cron has no timezone support; expect ±15 min scheduling jitter, so the brief typically lands between 8:00 and 8:20 AM SGT.
- Google News RSS links route through news.google.com redirects; the cited publisher name is extracted from the feed metadata.
- Sources are free feeds only — paywalled outlets (FT, Bloomberg) appear only via syndicated coverage.
- The brief is decision support, not investment advice; verify time-sensitive claims against primary sources before acting.

---

# Daily Inspiration Feed

A hand-curated, daily-rotating stack of essays, books, interviews, poetry, philosophy,
science, art, history, design, business and culture.

## Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript (strict)
- Plain CSS with design tokens (light/dark via `prefers-color-scheme`), no CSS framework

## Getting started

```sh
npm install
npm run dev        # local dev server
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + production build
npm run preview    # serve the production build
```

## Structure

- **Page**: `src/pages/DailyInspirationPage.tsx` — masthead, featured idea, "one idea to
  carry today", a <15-minute creative action, the daily feed (8–12 items), and a
  "save for the weekend" shelf. Includes loading (skeleton), error (retry) and empty states.
- **Components**: `src/components/inspiration/`
- **Data layer**: `src/data/inspiration/`
  - `types.ts` — domain model (`FeedItem`, `DailyDigest`, …)
  - `seed.ts` — curated seed content (real works, authors and links)
  - `provider.ts` — `InspirationSource` interface + seed-backed implementation that
    composes a deterministic digest per calendar day (seeded PRNG, category
    round-robin so each day stays varied)

### Swapping in a real backend

The page depends only on the `InspirationSource` interface. To use a CMS, RSS
pipeline, database or API, implement `getDailyDigest(date)` against that source and
point `inspirationSource` in `src/data/inspiration/provider.ts` at the new
implementation — no UI changes required.
