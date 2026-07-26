"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requireSession } from "@/lib/auth";
import { DASHBOARD_SECTIONS } from "@/lib/dashboardSections";
import { isMetric } from "@/lib/metrics";

function revalidateDashboard() {
  revalidatePath("/account");
  revalidatePath("/account/resources");
  revalidatePath("/account/announcements");
  revalidatePath("/admin/dashboard-content");
}

function sectionOf(formData: FormData): string {
  const raw = formData.get("section") as string;
  return DASHBOARD_SECTIONS.some((s) => s.id === raw)
    ? raw
    : DASHBOARD_SECTIONS[0].id;
}

function dataFrom(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string)?.trim() || null;
  return {
    section: sectionOf(formData),
    title: (formData.get("title") as string).trim(),
    subtitle: str("subtitle"),
    meta: str("meta"),
    note: str("note"),
    badge: str("badge"),
    icon: str("icon"),
    color: str("color"),
    href: str("href"),
    order: Number(formData.get("order")) || 0,
    active: formData.get("active") === "on",
    // Overview cards can count themselves; anything unknown falls back to off.
    metric: (() => {
      const raw = str("metric");
      return raw && isMetric(raw) ? raw : null;
    })(),
  };
}

function backTo(section: string) {
  redirect(`/admin/dashboard-content?section=${section}`);
}

export async function createDashboardItem(formData: FormData) {
  await requireSession();
  const data = dataFrom(formData);
  await prisma.dashboardItem.create({ data });
  revalidateDashboard();
  backTo(data.section);
}

export async function updateDashboardItem(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  const data = dataFrom(formData);
  await prisma.dashboardItem.update({ where: { id }, data });
  revalidateDashboard();
  backTo(data.section);
}

export async function deleteDashboardItem(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.dashboardItem.delete({ where: { id } }));
  revalidateDashboard();
}
