"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";
import { uploadImage } from "@/lib/upload";
import { normalizeHeroStyle } from "@/lib/hero";
import { publicPageHref } from "@/lib/publicPages";

function revalidateSlides() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/hero-slides");
}

function str(formData: FormData, key: string): string | null {
  const v = (formData.get(key) as string | null)?.trim();
  return v ? v : null;
}

const LOCATIONS = ["home", "home-about"];

function normalizeLocation(raw: FormDataEntryValue | null): string {
  const value = String(raw ?? "");
  return LOCATIONS.includes(value) ? value : "home";
}

function checked(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

function boundedNumber(
  formData: FormData,
  key: string,
  fallback: number,
  min: number,
  max: number,
): number {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function imageFilesFrom(formData: FormData): File[] {
  const values = [
    ...formData.getAll("imageFiles"),
    ...formData.getAll("imageFile"),
  ];
  return values.filter(
    (value): value is File =>
      typeof File !== "undefined" && value instanceof File && value.size > 0,
  );
}

async function imagesFrom(formData: FormData): Promise<string[]> {
  const files = imageFilesFrom(formData);
  if (files.length > 0) {
    return Promise.all(files.map((file) => uploadImage(file)));
  }

  const pasted = formData
    .getAll("imageUrl")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
  return pasted.slice(0, 1);
}

function dataFrom(formData: FormData, imageUrl: string) {
  const location = normalizeLocation(formData.get("location"));

  return {
    location,
    imageUrl,
    ...(location === "home"
      ? {
          heroStyle: normalizeHeroStyle(String(formData.get("heroStyle") ?? "")),
          darkenVisual: checked(formData, "darkenVisual"),
          softVisualOverlay: checked(formData, "softVisualOverlay"),
          backgroundBlur: checked(formData, "backgroundBlur"),
          textShadow: checked(formData, "textShadow"),
          darkenBackground: checked(formData, "darkenBackground"),
          textBackground: checked(formData, "textBackground"),
          strongTextBackground: checked(formData, "strongTextBackground"),
          bottomGradient: checked(formData, "bottomGradient"),
          topGradient: checked(formData, "topGradient"),
          panelOpacity: boundedNumber(formData, "panelOpacity", 40, 0, 90),
          panelBlur: boundedNumber(formData, "panelBlur", 16, 0, 24),
        }
      : {}),
    eyebrow: str(formData, "eyebrow"),
    titleStart: str(formData, "titleStart"),
    highlight: str(formData, "highlight"),
    titleEnd: str(formData, "titleEnd"),
    description: str(formData, "description"),
    primaryButtonLabel: str(formData, "primaryButtonLabel"),
    primaryButtonHref: publicPageHref(str(formData, "primaryButtonHref")),
    secondaryButtonLabel: str(formData, "secondaryButtonLabel"),
    secondaryButtonHref: publicPageHref(str(formData, "secondaryButtonHref")),
    title: str(formData, "title"),
    subtitle: str(formData, "subtitle"),
    caption: str(formData, "caption"),
    icon: str(formData, "icon"),
    order: Number(formData.get("order")) || 0,
  };
}

function backTo(location: string) {
  redirect(`/admin/hero-slides?loc=${normalizeLocation(location)}`);
}

export async function createHeroSlide(formData: FormData) {
  await requirePermission("hero-slides", "create");
  const imageUrls = await imagesFrom(formData);
  if (imageUrls.length === 0) {
    throw new Error("An image is required (upload a file or paste a URL).");
  }
  const data = dataFrom(formData, imageUrls[0]);
  await prisma.heroSlide.createMany({
    data: imageUrls.map((imageUrl, index) => ({
      ...data,
      imageUrl,
      order: data.order + index,
    })),
  });
  revalidateSlides();
  backTo(data.location);
}

export async function updateHeroSlide(formData: FormData) {
  await requirePermission("hero-slides", "edit");
  const id = formData.get("id") as string;
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) throw new Error("Slide not found");

  const imageUrls = await imagesFrom(formData);
  const data = dataFrom(formData, imageUrls[0] ?? existing.imageUrl);
  await prisma.heroSlide.update({ where: { id }, data });
  if (imageUrls.length > 1) {
    await prisma.heroSlide.createMany({
      data: imageUrls.slice(1).map((imageUrl, index) => ({
        ...data,
        imageUrl,
        order: data.order + index + 1,
      })),
    });
  }
  revalidateSlides();
  backTo(data.location);
}

export async function toggleHeroSlide(formData: FormData) {
  await requirePermission("hero-slides", "edit");
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) throw new Error("Slide not found");

  await prisma.heroSlide.update({
    where: { id },
    data: { isActive: !existing.isActive },
  });
  revalidateSlides();
}

export async function deleteHeroSlide(formData: FormData) {
  await requirePermission("hero-slides", "delete");
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.heroSlide.delete({ where: { id } }));
  revalidateSlides();
}
