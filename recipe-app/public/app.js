const $ = (sel) => document.querySelector(sel);

const form = $("#capture-form");
const urlInput = $("#url-input");
const textInput = $("#text-input");
const captionDetails = $("#caption-details");
const captureBtn = $("#capture-btn");
const status = $("#capture-status");
const grid = $("#recipe-grid");
const emptyState = $("#empty-state");
const searchInput = $("#search-input");
const tagBar = $("#tag-bar");
const dialog = $("#recipe-dialog");
const detail = $("#recipe-detail");

let activeTag = null;
let currentRecipeId = null;

function setStatus(msg, kind = "info") {
  status.hidden = !msg;
  status.textContent = msg;
  status.className = `status ${kind}`;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

const PLATFORM_ICONS = {
  instagram: "📸",
  tiktok: "🎵",
  youtube: "▶️",
  pinterest: "📌",
  facebook: "👥",
  web: "🌐",
  manual: "✍️",
};

async function loadRecipes() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set("q", searchInput.value.trim());
  if (activeTag) params.set("tag", activeTag);
  const res = await fetch(`/api/recipes?${params}`);
  const { recipes } = await res.json();

  grid.replaceChildren();
  emptyState.hidden = recipes.length > 0;

  for (const r of recipes) {
    const card = el("article", "card recipe-card");
    card.tabIndex = 0;
    if (r.image) {
      const img = el("img", "thumb");
      img.src = r.image;
      img.alt = "";
      img.loading = "lazy";
      img.onerror = () => img.remove();
      card.append(img);
    }
    const body = el("div", "card-body");
    body.append(el("h3", null, r.title));
    const meta = el("p", "meta");
    meta.textContent = `${PLATFORM_ICONS[r.source_platform] ?? "🌐"} ${
      r.total_time || r.cook_time || ""
    }`;
    body.append(meta);
    const tags = el("div", "tags");
    for (const t of (r.tags ?? []).slice(0, 4)) tags.append(el("span", "tag", t));
    body.append(tags);
    card.append(body);
    const open = () => showRecipe(r.id);
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => e.key === "Enter" && open());
    grid.append(card);
  }
}

async function loadTags() {
  const { tags } = await (await fetch("/api/tags")).json();
  tagBar.replaceChildren();
  for (const { tag, count } of tags.slice(0, 12)) {
    const btn = el("button", `tag chip${tag === activeTag ? " active" : ""}`, `${tag} (${count})`);
    btn.type = "button";
    btn.addEventListener("click", () => {
      activeTag = activeTag === tag ? null : tag;
      loadTags();
      loadRecipes();
    });
    tagBar.append(btn);
  }
}

async function showRecipe(id) {
  const res = await fetch(`/api/recipes/${id}`);
  if (!res.ok) return;
  const { recipe: r } = await res.json();
  currentRecipeId = id;

  detail.replaceChildren();
  detail.append(el("h2", null, r.title));
  if (r.description) detail.append(el("p", "desc", r.description));

  const facts = el("p", "meta");
  const bits = [];
  if (r.author) bits.push(`by ${r.author}`);
  if (r.servings) bits.push(r.servings);
  if (r.prep_time) bits.push(`prep ${r.prep_time}`);
  if (r.cook_time) bits.push(`cook ${r.cook_time}`);
  if (r.total_time) bits.push(`total ${r.total_time}`);
  facts.textContent = bits.join(" · ");
  detail.append(facts);

  if (r.source_url) {
    const link = el("a", "source-link", `${PLATFORM_ICONS[r.source_platform] ?? "🌐"} View original`);
    link.href = r.source_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    detail.append(link);
  }

  detail.append(el("h3", null, "Ingredients"));
  const ul = el("ul", "ingredients");
  for (const ing of r.ingredients ?? []) {
    const line = [ing.quantity, ing.unit, ing.item].filter(Boolean).join(" ");
    ul.append(el("li", null, ing.note ? `${line} — ${ing.note}` : line));
  }
  detail.append(ul);

  detail.append(el("h3", null, "Steps"));
  const ol = el("ol", "steps");
  for (const step of r.steps ?? []) ol.append(el("li", null, step));
  detail.append(ol);

  if (r.notes) {
    const note = el("p", "notes");
    note.textContent = `⚠️ ${r.notes}`;
    detail.append(note);
  }
  if (r.confidence && r.confidence !== "high") {
    detail.append(
      el("p", "confidence", `Extraction confidence: ${r.confidence} — double-check against the original.`)
    );
  }

  dialog.showModal();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const url = urlInput.value.trim();
  const text = textInput.value.trim();
  if (!url && !text) return setStatus("Enter a link or paste some recipe text.", "error");

  captureBtn.disabled = true;
  setStatus("Fetching and extracting… this takes a few seconds.");
  try {
    const res = await fetch("/api/capture", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: url || undefined, text: text || undefined }),
    });
    const data = await res.json();
    if (res.status === 422 && data.error === "needs_caption") {
      captionDetails.open = true;
      textInput.focus();
      setStatus(data.message, "error");
      return;
    }
    if (!res.ok) {
      setStatus(data.message || "Capture failed.", "error");
      return;
    }
    setStatus(
      data.duplicate ? "Already saved — here it is." : `Saved “${data.recipe.title}” ✓`,
      "ok"
    );
    urlInput.value = "";
    textInput.value = "";
    captionDetails.open = false;
    await Promise.all([loadRecipes(), loadTags()]);
    showRecipe(data.recipe.id);
  } catch (err) {
    setStatus(`Something went wrong: ${err.message}`, "error");
  } finally {
    captureBtn.disabled = false;
  }
});

$("#close-btn").addEventListener("click", () => dialog.close());
$("#delete-btn").addEventListener("click", async () => {
  if (!currentRecipeId) return;
  if (!confirm("Delete this recipe?")) return;
  await fetch(`/api/recipes/${currentRecipeId}`, { method: "DELETE" });
  dialog.close();
  await Promise.all([loadRecipes(), loadTags()]);
});

let searchTimer;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadRecipes, 250);
});

loadRecipes();
loadTags();
