import { slugify } from "@/lib/utils";

/**
 * A slug that is free to use, suffixing `-2`, `-3`… until it is.
 *
 * Every slug column in the schema is `@unique`, so a second "Tes" would throw
 * P2002 straight out of the admin form — and none of the content forms have an
 * error channel to show it in, so the admin just gets a crash. Picking the next
 * free slug is what the publications, event-category and research-category
 * actions already did; this is that logic in one place.
 *
 * `lookup` is passed in rather than a model name so each caller keeps its own
 * typed Prisma delegate. `ignoreId` lets an edit keep its current slug instead
 * of bumping itself to "-2" on every save.
 */
export async function uniqueSlug(
  lookup: (slug: string) => Promise<{ id: string } | null>,
  base: string,
  fallback: string,
  ignoreId?: string,
): Promise<string> {
  const root = slugify(base) || fallback;
  let slug = root;
  let n = 1;

  // Bounded so a pathological case can never spin forever against the database.
  while (n < 500) {
    const existing = await lookup(slug);
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${root}-${++n}`;
  }

  // 500 collisions on one title is not a real scenario; make it unmistakable
  // rather than silently returning a slug that will fail the insert.
  throw new Error(`Could not find a free slug for "${base}" after 500 tries`);
}
