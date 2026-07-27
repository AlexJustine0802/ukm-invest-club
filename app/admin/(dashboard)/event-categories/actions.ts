"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requireSession } from "@/lib/auth";
import { uniqueSlug as sharedUniqueSlug } from "@/lib/slugs";

const lookup = (slug: string) =>
  prisma.eventCategory.findUnique({ where: { slug } });

const uniqueSlug = (base: string, ignoreId?: string) =>
  sharedUniqueSlug(lookup, base, "category", ignoreId);

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
  await deleteIfExists(() => prisma.eventCategory.delete({ where: { id } }));
  revalidateEventCategories();
}
