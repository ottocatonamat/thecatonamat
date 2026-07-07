# thecatonamat

A small web app whose first feature is a **Daily Inspiration Feed** — a hand-curated,
daily-rotating stack of essays, books, interviews, poetry, philosophy, science, art,
history, design, business and culture.

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

## Daily Inspiration Feed

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
