"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/adminAccess";
import { NOTIFICATION_SOURCES } from "@/lib/notificationSources";

export async function updateNotificationSettings(formData: FormData) {
  await requireSuperAdmin();

  // Built from the shared list rather than spelled out, so adding a source
  // means touching one array instead of the schema, the form and this action.
  const data = Object.fromEntries(
    NOTIFICATION_SOURCES.map((s) => [s.id, formData.get(s.id) === "on"]),
  );

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });

  // The bell renders in the shell above every member page.
  revalidatePath("/account", "layout");
  revalidatePath("/admin/notifications");
}
