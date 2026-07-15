"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { resolveImage } from "@/lib/upload";

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

function dataFrom(formData: FormData, imageUrl: string) {
  return {
    location: normalizeLocation(formData.get("location")),
    imageUrl,
    eyebrow: str(formData, "eyebrow"),
    titleStart: str(formData, "titleStart"),
    highlight: str(formData, "highlight"),
    titleEnd: str(formData, "titleEnd"),
    description: str(formData, "description"),
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
  await requireSession();
  const imageUrl = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );
  if (!imageUrl) {
    throw new Error("An image is required (upload a file or paste a URL).");
  }
  const data = dataFrom(formData, imageUrl);
  await prisma.heroSlide.create({ data });
  revalidateSlides();
  backTo(data.location);
}

export async function updateHeroSlide(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) throw new Error("Slide not found");

  const resolved = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );
  const data = dataFrom(formData, resolved ?? existing.imageUrl);
  await prisma.heroSlide.update({ where: { id }, data });
  revalidateSlides();
  backTo(data.location);
}

export async function deleteHeroSlide(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  await prisma.heroSlide.delete({ where: { id } });
  revalidateSlides();
}
