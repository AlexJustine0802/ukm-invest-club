"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { resolveImage } from "@/lib/upload";

function revalidateGallery() {
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function createGalleryImage(formData: FormData) {
  await requireSession();
  const imageUrl = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );
  if (!imageUrl) {
    throw new Error("An image is required (upload a file or paste a URL).");
  }
  await prisma.galleryImage.create({
    data: {
      title: (formData.get("title") as string).trim(),
      caption: (formData.get("caption") as string)?.trim() || null,
      order: Number(formData.get("order")) || 0,
      imageUrl,
    },
  });
  revalidateGallery();
  redirect("/admin/gallery");
}

export async function updateGalleryImage(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  if (!existing) throw new Error("Image not found");

  const resolved = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );

  await prisma.galleryImage.update({
    where: { id },
    data: {
      title: (formData.get("title") as string).trim(),
      caption: (formData.get("caption") as string)?.trim() || null,
      order: Number(formData.get("order")) || 0,
      imageUrl: resolved ?? existing.imageUrl,
    },
  });
  revalidateGallery();
  redirect("/admin/gallery");
}

export async function deleteGalleryImage(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  await prisma.galleryImage.delete({ where: { id } });
  revalidateGallery();
}
