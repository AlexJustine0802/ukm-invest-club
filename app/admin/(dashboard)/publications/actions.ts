"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requireSession } from "@/lib/auth";
import { resolveImage } from "@/lib/upload";
import { slugify } from "@/lib/utils";

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "publication";
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.publication.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${root}-${++n}`;
  }
}

function revalidatePublications() {
  revalidatePath("/publications");
  revalidatePath("/publications/all");
  revalidatePath("/");
  revalidatePath("/admin/publications");
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
    featured: formData.get("featured") === "on",
    featuredOrder: Number(formData.get("featuredOrder")) || 0,
    pageCount: pageCountRaw ? Number(pageCountRaw) : null,
    badge: (formData.get("badge") as string)?.trim() || null,
  };
}

export async function createPublication(formData: FormData) {
  await requireSession();
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
  await requireSession();
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
  await requireSession();
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.publication.delete({ where: { id } }));
  revalidatePublications();
}
