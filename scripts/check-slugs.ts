/**
 * Asserts uniqueSlug picks a free slug instead of throwing P2002.
 *
 *   npx tsx --env-file=.env scripts/check-slugs.ts
 */
import assert from "node:assert/strict";
import { uniqueSlug } from "../lib/slugs";

async function main() {
  // A fake table, so this runs without touching the database.
  const taken = new Map<string, { id: string }>([
    ["tes", { id: "row-1" }],
    ["tes-2", { id: "row-2" }],
  ]);
  const lookup = async (slug: string) => taken.get(slug) ?? null;

  // Free slug is returned untouched.
  assert.equal(await uniqueSlug(lookup, "Brand New", "form"), "brand-new");

  // Collisions walk past every taken variant.
  assert.equal(await uniqueSlug(lookup, "Tes", "form"), "tes-3");

  // An edit keeps its own slug rather than bumping itself every save.
  assert.equal(await uniqueSlug(lookup, "Tes", "form", "row-1"), "tes");
  // ...but still moves aside for a different row's slug.
  assert.equal(await uniqueSlug(lookup, "Tes", "form", "row-9"), "tes-3");

  // A title that slugifies to nothing falls back rather than producing "".
  assert.equal(await uniqueSlug(lookup, "!!!", "form"), "form");

  // The loop is bounded, so a pathological table cannot hang a request.
  const always = async () => ({ id: "someone-else" });
  await assert.rejects(
    () => uniqueSlug(always, "x", "form"),
    /after 500 tries/,
  );

  console.log("  ok  free slug, collisions, self-edit, fallback, bounded loop");
  console.log("\nslug guards behave");
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
