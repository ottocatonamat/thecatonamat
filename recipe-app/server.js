import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gatherSource } from "./lib/fetchers.js";
import { extractRecipe } from "./lib/claude.js";
import {
  allTags,
  deleteRecipe,
  findBySourceUrl,
  getRecipe,
  listRecipes,
  saveRecipe,
} from "./lib/store.js";

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "256kb" }));
app.use(express.static(path.join(ROOT, "public")));

// Capture a recipe from a URL and/or pasted text.
// Body: { url?: string, text?: string }
app.post("/api/capture", async (req, res) => {
  const { url, text } = req.body ?? {};
  if (!url && !text) return res.status(400).json({ error: "Provide a url or pasted text." });

  try {
    let platform = "manual";
    let image = null;
    let rawText = text?.trim() ?? "";

    if (url) {
      const existing = await findBySourceUrl(url);
      if (existing) return res.json({ recipe: existing, duplicate: true });

      const gathered = await gatherSource(url);
      platform = gathered.platform;
      image = gathered.image;
      // Pasted text (e.g. an Instagram caption) takes priority; fetched
      // material supplements it.
      rawText = [rawText, gathered.rawText].filter(Boolean).join("\n\n");

      if (gathered.needsCaption && !text) {
        return res.status(422).json({
          error: "needs_caption",
          message:
            "Couldn't read this post automatically (login wall). Paste the caption text and try again.",
          platform,
        });
      }
    }

    const extracted = await extractRecipe(rawText, url ?? "");
    if (!extracted.is_recipe) {
      return res.status(422).json({
        error: "not_a_recipe",
        message: "No recipe found in this content.",
      });
    }

    const recipe = await saveRecipe({
      ...extracted,
      source_url: url ?? "",
      source_platform: platform,
      image: image ?? "",
    });
    res.json({ recipe });
  } catch (err) {
    console.error("capture failed:", err);
    res.status(500).json({ error: "capture_failed", message: err.message });
  }
});

app.get("/api/recipes", async (req, res) => {
  res.json({ recipes: await listRecipes({ q: req.query.q, tag: req.query.tag }) });
});

app.get("/api/recipes/:id", async (req, res) => {
  const recipe = await getRecipe(req.params.id);
  if (!recipe) return res.status(404).json({ error: "not_found" });
  res.json({ recipe });
});

app.delete("/api/recipes/:id", async (req, res) => {
  const ok = await deleteRecipe(req.params.id);
  res.status(ok ? 200 : 404).json({ ok });
});

app.get("/api/tags", async (_req, res) => {
  res.json({ tags: await allTags() });
});

app.listen(PORT, () => {
  console.log(`Recipe box running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("⚠ ANTHROPIC_API_KEY is not set — captures will fail until you set it.");
  }
});
