"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "category";
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.eventCategory.findUnique({
      where: { slug },
    });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${root}-${++n}`;
  }
}

function revalidateEventCategories() {
  revalidatePath("/events");
  revalidatePath("/events/all");
  revalidatePath("/admin/event-categories");
}

function parseFields(formData: FormData) {
  return {
    title: (formData.get("title") as string).trim(),
    description: (formData.get("description") as string)?.trim() || null,
    icon: (formData.get("icon") as string) || "Building2",
    color: (formData.get("color") as string)?.trim() || null,
    order: Number(formData.get("order")) || 0,
  };
}

export async function createEventCategory(formData: FormData) {
  await requireSession();
  const fields = parseFields(formData);

  await prisma.eventCategory.create({
    data: {
      ...fields,
      slug: await uniqueSlug(fields.title),
    },
  });

  revalidateEventCategories();
  redirect("/admin/event-categories");
}

export async function updateEventCategory(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  const fields = parseFields(formData);

  await prisma.eventCategory.update({
    where: { id },
    data: {
      ...fields,
      slug: await uniqueSlug(fields.title, id),
    },
  });

  revalidateEventCategories();
  redirect("/admin/event-categories");
}

export async function deleteEventCategory(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  await prisma.eventCategory.delete({ where: { id } });
  revalidateEventCategories();
}
