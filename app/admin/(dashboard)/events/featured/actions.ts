"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/adminAccess";

// Tick events to feature them in the Events page hero.
export async function setFeaturedEvents(formData: FormData) {
  await requirePermission("events", "manage");
  const all = ((formData.get("allIds") as string) ?? "")
    .split(",")
    .filter(Boolean);
  const chosen = formData.getAll("featured") as string[];
  const unchosen = all.filter((id) => !chosen.includes(id));

  await prisma.event.updateMany({
    where: { id: { in: chosen } },
    data: { featured: true },
  });
  await prisma.event.updateMany({
    where: { id: { in: unchosen } },
    data: { featured: false },
  });

  revalidatePath("/events");
  revalidatePath("/admin/events/featured");
  redirect("/admin/events/featured");
}
