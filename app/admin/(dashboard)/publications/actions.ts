"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";
import { resolveImage } from "@/lib/upload";
import { slugify } from "@/lib/utils";
import { uniqueSlug as sharedUniqueSlug } from "@/lib/slugs";

const lookup = (slug: string) =>
  prisma.publication.findUnique({ where: { slug } });

const uniqueSlug = (base: string, ignoreId?: string) =>
  sharedUniqueSlug(lookup, base, "publication", ignoreId);

function revalidatePublications() {
  revalidatePath("/publications");
  revalidatePath("/publications/all");
  revalidatePath("/");
  revalidatePath("/admin/publications");
}

/** Add a research category from the publication form without losing draft data. */
export async function createResearchCategoryInline(
  title: string,
): Promise<{ value: string; label: string } | { error: string }> {
  await requirePermission("research-categories", "create");

  const clean = title.trim();
  if (!clean) return { error: "Give the category a name." };

  const existing = await prisma.researchCategory.findFirst({
    where: { title: clean },
    select: { id: true, title: true },
  });
  const category =
    existing ??
    (await prisma.researchCategory.create({
      data: {
        title: clean,
        slug: await sharedUniqueSlug(
          (slug) => prisma.researchCategory.findUnique({ where: { slug } }),
          slugify(clean),
          "category",
        ),
      },
      select: { id: true, title: true },
    }));

  revalidatePath("/publications");
  revalidatePath("/publications/all");
  revalidatePath("/admin/publications");
  revalidatePath("/admin/research-categories");
  return { value: category.id, label: category.title };
}

function parseFields(formData: FormData) {
  const publishedAtRaw = (formData.get("publishedAt") as string)?.trim();
  const categoryId = (formData.get("categoryId") as string)?.trim();
  const pageCountRaw = (formData.get("pageCount") as string)?.trim();
  return {
    title: (formData.get("title") as string).trim(),
    excerpt: (formData.get("excerpt") as string).trim(),
    content: (formData.get("content") as string).trim(),
    author: (formData.get("author") as string)?.trim() || null,
    published: formData.get("published") === "on",
    publishedAt: publishedAtRaw ? new Date(publishedAtRaw) : new Date(),
    categoryId: categoryId || null,
    // featured / featuredOrder are not written any more: the research hero is
    // the newest published research, see HERO_SLIDES in app/(site)/publications.
    // Page count and hero badge left the form with it, so they are only written
    // when something actually submitted them  never wiped by their absence.
    ...(formData.has("pageCount")
      ? { pageCount: pageCountRaw ? Number(pageCountRaw) : null }
      : {}),
    ...(formData.has("badge")
      ? { badge: (formData.get("badge") as string)?.trim() || null }
      : {}),
  };
}

export async function createPublication(formData: FormData) {
  await requirePermission("publications", "create");
  const fields = parseFields(formData);
  const coverImage = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );

  await prisma.publication.create({
    data: {
      ...fields,
      slug: await uniqueSlug(fields.title),
      coverImage,
    },
  });

  revalidatePublications();
  redirect("/admin/publications");
}

export async function updatePublication(formData: FormData) {
  await requirePermission("publications", "edit");
  const id = formData.get("id") as string;
  const fields = parseFields(formData);
  const coverImage = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );

  await prisma.publication.update({
    where: { id },
    data: {
      ...fields,
      slug: await uniqueSlug(fields.title, id),
      coverImage,
    },
  });

  revalidatePublications();
  redirect("/admin/publications");
}

export async function deletePublication(formData: FormData) {
  await requirePermission("publications", "delete");
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.publication.delete({ where: { id } }));
  revalidatePublications();
}
