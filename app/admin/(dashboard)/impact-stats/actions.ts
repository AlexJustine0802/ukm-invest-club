"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

function revalidateStats() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/publications");
  revalidatePath("/admin/impact-stats");
}

function sectionOf(formData: FormData): string {
  return formData.get("section") === "research" ? "research" : "home";
}

function dataFrom(formData: FormData) {
  return {
    label: (formData.get("label") as string).trim(),
    value: (formData.get("value") as string).trim(),
    icon: (formData.get("icon") as string) || "TrendingUp",
    section: sectionOf(formData),
    order: Number(formData.get("order")) || 0,
  };
}

function backTo(section: string) {
  redirect(
    section === "research"
      ? "/admin/impact-stats?section=research"
      : "/admin/impact-stats",
  );
}

export async function createImpactStat(formData: FormData) {
  await requireSession();
  const data = dataFrom(formData);
  await prisma.impactStat.create({ data });
  revalidateStats();
  backTo(data.section);
}

export async function updateImpactStat(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  const data = dataFrom(formData);
  await prisma.impactStat.update({ where: { id }, data });
  revalidateStats();
  backTo(data.section);
}

export async function deleteImpactStat(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  await prisma.impactStat.delete({ where: { id } });
  revalidateStats();
}
