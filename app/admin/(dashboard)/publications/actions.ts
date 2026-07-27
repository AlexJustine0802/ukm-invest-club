"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";
import { resolveImage } from "@/lib/upload";
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
