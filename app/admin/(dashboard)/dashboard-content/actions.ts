"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";
import { DASHBOARD_SECTIONS } from "@/lib/dashboardSections";
import { isMetric } from "@/lib/metrics";
import { slugify } from "@/lib/utils";
import { uniqueSlug } from "@/lib/slugs";

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

/** Every folder card looks the same, so neither is asked for in the form. */
const FOLDER_STYLE = { icon: "FolderClosed", color: "bg-blue-500" };

function dataFrom(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string)?.trim() || null;
  const section = sectionOf(formData);
  return {
    section,
    title: (formData.get("title") as string).trim(),
    subtitle: str("subtitle"),
    meta: str("meta"),
    note: str("note"),
    badge: str("badge"),
    ...(section === "folder"
      ? FOLDER_STYLE
      : { icon: str("icon"), color: str("color") }),
    // Sections whose form no longer offers a link (resources, folders) must not
    // have the stored one wiped just because the field was not submitted.
    ...(formData.has("href") ? { href: str("href") } : {}),
    ...(formData.has("order") ? { order: Number(formData.get("order")) || 0 } : {}),
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

/**
 * Add a research category from the folder form's dialog.
 *
 * Guarded by research-categories, not dashboard-content: the row shows up on
 * the public research page, so it is that module's permission to give.
 */
export async function createFolderCategory(
  title: string,
): Promise<{ value: string; label: string } | { error: string }> {
  await requirePermission("research-categories", "create");

  const clean = title.trim();
  if (!clean) return { error: "Give the category a name." };

  const existing = await prisma.researchCategory.findFirst({
    where: { title: clean },
    select: { title: true },
  });
  if (existing) return { value: existing.title, label: existing.title };

  const created = await prisma.researchCategory.create({
    data: {
      title: clean,
      slug: await uniqueSlug(
        (s) => prisma.researchCategory.findUnique({ where: { slug: s } }),
        slugify(clean),
        "category",
      ),
    },
    select: { title: true },
  });

  revalidatePath("/publications");
  revalidatePath("/admin/research-categories");
  // Folders store the title, not the id  that is what members see on the card.
  return { value: created.title, label: created.title };
}

export async function createDashboardItem(formData: FormData) {
  await requirePermission("dashboard-content", "create");
  const data = dataFrom(formData);
  await prisma.dashboardItem.create({ data });
  revalidateDashboard();
  backTo(data.section);
}

export async function updateDashboardItem(formData: FormData) {
  await requirePermission("dashboard-content", "edit");
  const id = formData.get("id") as string;
  const data = dataFrom(formData);
  await prisma.dashboardItem.update({ where: { id }, data });
  revalidateDashboard();
  backTo(data.section);
}

export async function deleteDashboardItem(formData: FormData) {
  await requirePermission("dashboard-content", "delete");
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.dashboardItem.delete({ where: { id } }));
  revalidateDashboard();
}
