"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";

function revalidateAnnouncements() {
  revalidatePath("/admin/announcements");
  revalidatePath("/admin/dashboard-content");
  revalidatePath("/account");
  revalidatePath("/account/announcements");
}

/** Written announcements are DashboardItems; the section is never chosen here. */
function dataFrom(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string)?.trim() || null;
  return {
    section: "announcement",
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
  };
}

export async function createAnnouncement(formData: FormData) {
  await requirePermission("announcements", "create");
  await prisma.dashboardItem.create({ data: dataFrom(formData) });
  revalidateAnnouncements();
  redirect("/admin/announcements");
}

export async function updateAnnouncement(formData: FormData) {
  await requirePermission("announcements", "edit");
  const id = formData.get("id") as string;
  await prisma.dashboardItem.update({ where: { id }, data: dataFrom(formData) });
  revalidateAnnouncements();
  redirect("/admin/announcements");
}

export async function deleteAnnouncement(formData: FormData) {
  await requirePermission("announcements", "delete");
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.dashboardItem.delete({ where: { id } }));
  revalidateAnnouncements();
}

/**
 * Flip the announce switch on something that already exists.
 *
 * Same flag the Career and Registration Form editors set, so announcing here
 * and announcing there cannot drift apart.
 */
export async function setAnnounced(formData: FormData) {
  await requirePermission("announcements", "manage");
  const id = formData.get("id") as string;
  const announced = formData.get("announced") === "1";

  if (formData.get("kind") === "career") {
    await prisma.careerAlert.update({ where: { id }, data: { announced } });
  } else {
    await prisma.registrationForm.update({ where: { id }, data: { announced } });
  }

  revalidateAnnouncements();
  revalidatePath("/admin/career");
  revalidatePath("/admin/registrations");
}
