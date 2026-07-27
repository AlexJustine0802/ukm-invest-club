"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";
import { uniqueSlug as sharedUniqueSlug } from "@/lib/slugs";

const lookup = (slug: string) =>
  prisma.researchCategory.findUnique({ where: { slug } });

const uniqueSlug = (base: string, ignoreId?: string) =>
  sharedUniqueSlug(lookup, base, "category", ignoreId);

function revalidateResearchCategories() {
  revalidatePath("/publications");
  revalidatePath("/publications/all");
  revalidatePath("/admin/research-categories");
}

function parseFields(formData: FormData) {
  return {
    title: (formData.get("title") as string).trim(),
    description: (formData.get("description") as string)?.trim() || null,
    icon: (formData.get("icon") as string) || "PieChart",
    order: Number(formData.get("order")) || 0,
  };
}

export async function createResearchCategory(formData: FormData) {
  await requirePermission("research-categories", "create");
  const fields = parseFields(formData);

  await prisma.researchCategory.create({
    data: {
      ...fields,
      slug: await uniqueSlug(fields.title),
    },
  });

  revalidateResearchCategories();
  redirect("/admin/research-categories");
}

export async function updateResearchCategory(formData: FormData) {
  await requirePermission("research-categories", "edit");
  const id = formData.get("id") as string;
  const fields = parseFields(formData);

  await prisma.researchCategory.update({
    where: { id },
    data: {
      ...fields,
      slug: await uniqueSlug(fields.title, id),
    },
  });

  revalidateResearchCategories();
  redirect("/admin/research-categories");
}

export async function deleteResearchCategory(formData: FormData) {
  await requirePermission("research-categories", "delete");
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.researchCategory.delete({ where: { id } }));
  revalidateResearchCategories();
}
