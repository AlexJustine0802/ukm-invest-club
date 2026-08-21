"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";
import { resolveImage, uploadImage } from "@/lib/upload";

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

function imageFilesFrom(formData: FormData): File[] {
  return formData.getAll("imageFile").filter(
    (value): value is File =>
      typeof File !== "undefined" && value instanceof File && value.size > 0,
  );
}

async function uploadedImagesFrom(formData: FormData): Promise<string[]> {
  const files = imageFilesFrom(formData);
  return files.length > 0
    ? Promise.all(files.map((file) => uploadImage(file)))
    : [];
}

export async function createMoment(formData: FormData) {
  await requirePermission("community", "create");
  const uploadedImages = await uploadedImagesFrom(formData);
  const coverImage =
    uploadedImages[0] ??
    (await resolveImage(null, formData.get("imageUrl") as string | null));
  if (!coverImage) {
    throw new Error(
      "A cover image is required (upload a file or paste a URL).",
    );
  }

  const photoUrls = [
    ...uploadedImages.slice(1),
    ...parsePhotoUrls(formData.get("photoUrls") as string | null),
  ];

  await prisma.moment.create({
    data: {
      title: (formData.get("title") as string).trim(),
      category: (formData.get("category") as string).trim(),
      date: new Date(formData.get("date") as string),
      order: 0,
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
  await requirePermission("community", "edit");
  const id = formData.get("id") as string;
  const existing = await prisma.moment.findUnique({ where: { id } });
  if (!existing) throw new Error("Moment not found");

  const uploadedImages = await uploadedImagesFrom(formData);
  const resolved =
    uploadedImages[0] ??
    (await resolveImage(null, formData.get("imageUrl") as string | null));

  await prisma.moment.update({
    where: { id },
    data: {
      title: (formData.get("title") as string).trim(),
      category: (formData.get("category") as string).trim(),
      date: new Date(formData.get("date") as string),
      coverImage: resolved ?? existing.coverImage,
    },
  });
  if (uploadedImages.length > 1) {
    const count = await prisma.momentPhoto.count({ where: { momentId: id } });
    await prisma.momentPhoto.createMany({
      data: uploadedImages.slice(1).map((imageUrl, index) => ({
        momentId: id,
        imageUrl,
        order: count + index,
      })),
    });
  }
  revalidateCommunity();
  redirect("/admin/community");
}

export async function deleteMoment(formData: FormData) {
  await requirePermission("community", "delete");
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.moment.delete({ where: { id } }));
  revalidateCommunity();
}

export async function addMomentPhoto(formData: FormData) {
  await requirePermission("community", "edit");
  const momentId = formData.get("momentId") as string;
  const imageUrl = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );
  if (!imageUrl) return;

  const count = await prisma.momentPhoto.count({ where: { momentId } });
  await prisma.momentPhoto.create({
    data: { momentId, imageUrl, order: count },
  });
  revalidateCommunity();
  revalidatePath(`/admin/community/${momentId}/edit`);
}

export async function deleteMomentPhoto(formData: FormData) {
  await requirePermission("community", "edit");
  const id = formData.get("id") as string;
  const photo = await prisma.momentPhoto.findUnique({ where: { id } });
  if (!photo) return;
  await deleteIfExists(() => prisma.momentPhoto.delete({ where: { id } }));
  revalidateCommunity();
  revalidatePath(`/admin/community/${photo.momentId}/edit`);
}
