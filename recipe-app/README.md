# Recipe Box — AI recipe capture

Paste any link — an Instagram reel, a TikTok, a YouTube video, a food blog — and keep the recipe in a searchable personal collection. You can also paste raw caption text when a platform blocks scraping.

## How extraction works

Extraction is layered: cheap deterministic methods first, AI to normalize whatever raw material was found.

1. **schema.org/Recipe JSON-LD** — most food blogs embed a machine-readable recipe in a `<script type="application/ld+json">` tag. When present, this is the highest-fidelity source.
2. **oEmbed endpoints** — YouTube and TikTok expose public oEmbed APIs that return the video title/caption and author without authentication.
3. **OpenGraph meta tags** — `og:title` / `og:description` / `og:image` from the page HTML.
4. **Stripped page text** — as a last resort, the page HTML with scripts/tags removed.
5. **Claude normalization** — everything gathered above is sent to Claude (`claude-opus-4-8`) with a strict JSON schema (structured outputs), which returns a clean recipe: title, structured ingredients (quantity/unit/item/note), numbered steps, times, servings, tags, cuisine, and a confidence rating. Anything the model had to infer is flagged in `notes`.

**Instagram caveat:** Instagram sits behind a login wall, so automated fetching often fails. When that happens the app asks you to paste the caption (Share → Copy caption on your phone), and extraction runs on the pasted text instead. This is the reliable path for IG reels.

## Run it

```sh
cd recipe-app
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # or put it in the repo .env and source it
npm start                              # http://localhost:3000
```

Optional env vars: `CLAUDE_MODEL` (default `claude-opus-4-8`), `PORT` (default 3000).

## Storage

Recipes are stored in `recipe-app/data/recipes.json` (gitignored). It's a flat JSON file — simple, portable, easy to back up. Swap `lib/store.js` for SQLite if the collection grows past a few thousand entries.

## API

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/capture` | `{url?, text?}` → extract + save. Returns `422 needs_caption` when a platform blocked fetching. |
| `GET` | `/api/recipes?q=&tag=` | List/search |
| `GET` | `/api/recipes/:id` | Detail |
| `DELETE` | `/api/recipes/:id` | Remove |
| `GET` | `/api/tags` | Tag counts for the filter bar |

## Possible next steps

- **Video-frame extraction**: for recipes only shown on screen (never in the caption), download keyframes with `yt-dlp` and send them to Claude as images — it reads on-screen ingredient lists well.
- **Share-sheet capture**: a PWA share target or iOS Shortcut that POSTs the URL straight to `/api/capture` from your phone.
- **Scaling & conversion**: ingredient quantities are already structured, so 2×/½× scaling and metric conversion are straightforward UI additions.
