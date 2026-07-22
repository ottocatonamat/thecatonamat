// Claude normalization: raw caption/page text in, clean structured recipe out.
// Uses output_config.format (structured outputs) so the response is guaranteed
// to be valid JSON matching RECIPE_SCHEMA — no parsing failures, no prose.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";

const client = new Anthropic();

export const RECIPE_SCHEMA = {
  type: "object",
  properties: {
    is_recipe: {
      type: "boolean",
      description: "False if the source content does not actually contain a recipe",
    },
    title: { type: "string" },
    description: { type: "string", description: "One or two sentences. Empty string if none." },
    author: { type: "string", description: "Creator/author name, empty string if unknown" },
    servings: { type: "string", description: "e.g. '4 servings', empty string if unknown" },
    prep_time: { type: "string", description: "e.g. '15 min', empty string if unknown" },
    cook_time: { type: "string", description: "e.g. '30 min', empty string if unknown" },
    total_time: { type: "string", description: "e.g. '45 min', empty string if unknown" },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          quantity: { type: "string", description: "e.g. '2', '1/2', empty if none" },
          unit: { type: "string", description: "e.g. 'cups', 'tbsp', empty if none" },
          item: { type: "string", description: "The ingredient itself" },
          note: { type: "string", description: "e.g. 'finely chopped', empty if none" },
        },
        required: ["quantity", "unit", "item", "note"],
        additionalProperties: false,
      },
    },
    steps: { type: "array", items: { type: "string" } },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "3-6 lowercase tags: cuisine, meal type, diet, main ingredient, method",
    },
    cuisine: { type: "string", description: "e.g. 'italian', empty string if unclear" },
    confidence: {
      type: "string",
      enum: ["high", "medium", "low"],
      description:
        "high = complete recipe present in source; medium = partial, some inference; low = mostly inferred from a vague caption",
    },
    notes: {
      type: "string",
      description: "Anything inferred or missing the user should double-check. Empty string if nothing.",
    },
  },
  required: [
    "is_recipe",
    "title",
    "description",
    "author",
    "servings",
    "prep_time",
    "cook_time",
    "total_time",
    "ingredients",
    "steps",
    "tags",
    "cuisine",
    "confidence",
    "notes",
  ],
  additionalProperties: false,
};

const SYSTEM = `You extract recipes from messy source material: social media captions, video descriptions, scraped web pages, or schema.org JSON-LD data.

Rules:
- Preserve the author's quantities, ingredients, and step order exactly. Never invent quantities that are not in the source.
- If the source has a full recipe, transcribe it faithfully (confidence: high).
- If the source only partially describes the recipe (common for short video captions), extract what is there and fill obvious gaps conservatively, flagging every inference in notes (confidence: medium or low).
- Clean up formatting: split run-on ingredient lists, number the steps, normalize units as written (do not convert between metric/imperial).
- If the content contains no recipe at all, set is_recipe to false and leave the arrays empty.`;

/**
 * @param {string} rawText  gathered source material
 * @param {string} sourceUrl  original URL ("" when text was pasted directly)
 * @returns parsed recipe object matching RECIPE_SCHEMA
 */
export async function extractRecipe(rawText, sourceUrl) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    output_config: { format: { type: "json_schema", schema: RECIPE_SCHEMA } },
    messages: [
      {
        role: "user",
        content: `Source URL: ${sourceUrl || "(pasted text, no URL)"}\n\nSource material:\n\n${rawText}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The model declined to process this content.");
  }
  const text = response.content.find((b) => b.type === "text")?.text;
  if (!text) throw new Error("Empty extraction response");
  return JSON.parse(text);
}
