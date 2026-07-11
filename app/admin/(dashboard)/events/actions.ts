"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { resolveImage } from "@/lib/upload";
import { slugify } from "@/lib/utils";

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  const root = slugify(base) || "event";
  let slug = root;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${root}-${++n}`;
  }
}

function revalidateEvents() {
  revalidatePath("/events");
  revalidatePath("/events/all");
  revalidatePath("/");
  revalidatePath("/admin/events");
}

export async function createEvent(formData: FormData) {
  await requireSession();

  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string).trim();
  const eventDate = new Date(formData.get("eventDate") as string);
  const location = (formData.get("location") as string)?.trim() || null;
  const published = formData.get("published") === "on";
  const categoryId = (formData.get("categoryId") as string)?.trim() || null;
  const coverImage = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );

  await prisma.event.create({
    data: {
      title,
      slug: await uniqueSlug(title),
      description,
      eventDate,
      location,
      coverImage,
      published,
      categoryId,
    },
  });

  revalidateEvents();
  redirect("/admin/events");
}

export async function updateEvent(formData: FormData) {
  await requireSession();

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string).trim();
  const eventDate = new Date(formData.get("eventDate") as string);
  const location = (formData.get("location") as string)?.trim() || null;
  const published = formData.get("published") === "on";
  const categoryId = (formData.get("categoryId") as string)?.trim() || null;
  const coverImage = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );

  await prisma.event.update({
    where: { id },
    data: {
      title,
      slug: await uniqueSlug(title, id),
      description,
      eventDate,
      location,
      coverImage,
      published,
      categoryId,
    },
  });

  revalidateEvents();
  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  await prisma.event.delete({ where: { id } });
  revalidateEvents();
}
