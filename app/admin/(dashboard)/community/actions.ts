"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requireSession } from "@/lib/auth";
import { resolveImage } from "@/lib/upload";

function revalidateCommunity() {
  revalidatePath("/community");
  revalidatePath("/about");
  revalidatePath("/admin/community");
}

function parsePhotoUrls(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function createMoment(formData: FormData) {
  await requireSession();
  const coverImage = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );
  if (!coverImage) {
    throw new Error(
      "A cover image is required (upload a file or paste a URL).",
    );
  }

  const photoUrls = parsePhotoUrls(formData.get("photoUrls") as string | null);

  await prisma.moment.create({
    data: {
      title: (formData.get("title") as string).trim(),
      category: (formData.get("category") as string).trim(),
      date: new Date(formData.get("date") as string),
      order: Number(formData.get("order")) || 0,
      coverImage,
      photos: {
        create: photoUrls.map((imageUrl, i) => ({ imageUrl, order: i })),
      },
    },
  });
  revalidateCommunity();
  redirect("/admin/community");
}

export async function updateMoment(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  const existing = await prisma.moment.findUnique({ where: { id } });
  if (!existing) throw new Error("Moment not found");

  const resolved = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );

  await prisma.moment.update({
    where: { id },
    data: {
      title: (formData.get("title") as string).trim(),
      category: (formData.get("category") as string).trim(),
      date: new Date(formData.get("date") as string),
      order: Number(formData.get("order")) || 0,
      coverImage: resolved ?? existing.coverImage,
    },
  });
  revalidateCommunity();
  redirect("/admin/community");
}

export async function deleteMoment(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.moment.delete({ where: { id } }));
  revalidateCommunity();
}

export async function addMomentPhoto(formData: FormData) {
  await requireSession();
  const momentId = formData.get("momentId") as string;
  const imageUrl = (formData.get("imageUrl") as string)?.trim();
  if (!imageUrl) return;

  const count = await prisma.momentPhoto.count({ where: { momentId } });
  await prisma.momentPhoto.create({
    data: { momentId, imageUrl, order: count },
  });
  revalidateCommunity();
  revalidatePath(`/admin/community/${momentId}/edit`);
}

export async function deleteMomentPhoto(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  const photo = await prisma.momentPhoto.findUnique({ where: { id } });
  if (!photo) return;
  await deleteIfExists(() => prisma.momentPhoto.delete({ where: { id } }));
  revalidateCommunity();
  revalidatePath(`/admin/community/${photo.momentId}/edit`);
}
