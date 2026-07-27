"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/adminAccess";

// Tick publications to feature them in the Research page hero.
export async function setFeaturedPublications(formData: FormData) {
  await requirePermission("publications", "manage");
  const all = ((formData.get("allIds") as string) ?? "")
    .split(",")
    .filter(Boolean);
  const chosen = formData.getAll("featured") as string[];
  const unchosen = all.filter((id) => !chosen.includes(id));

  await prisma.publication.updateMany({
    where: { id: { in: chosen } },
    data: { featured: true },
  });
  await prisma.publication.updateMany({
    where: { id: { in: unchosen } },
    data: { featured: false },
  });

  revalidatePath("/publications");
  revalidatePath("/admin/publications/featured");
  redirect("/admin/publications/featured");
}
