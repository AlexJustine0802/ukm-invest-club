"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";
import { resolveImage } from "@/lib/upload";

function revalidateWaGroups() {
  revalidatePath("/admin/wa-groups");
  revalidatePath("/account/wa-group");
  revalidatePath("/account", "layout");
}

function fields(formData: FormData) {
  return {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    href: String(formData.get("href") ?? "").trim(),
    order: Number(formData.get("order")) || 0,
  };
}

export async function toggleWaGroups(formData: FormData) {
  await requirePermission("wa-groups", "edit");
  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { whatsappGroupsEnabled: formData.get("enabled") === "on" },
    create: {
      id: 1,
      whatsappGroupsEnabled: formData.get("enabled") === "on",
    },
  });
  revalidateWaGroups();
}

export async function createWaGroupCard(formData: FormData) {
  await requirePermission("wa-groups", "create");
  const imageUrl = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );
  await prisma.waGroupCard.create({ data: { ...fields(formData), imageUrl } });
  revalidateWaGroups();
  redirect("/admin/wa-groups");
}

export async function updateWaGroupCard(formData: FormData) {
  await requirePermission("wa-groups", "edit");
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.waGroupCard.findUnique({ where: { id } });
  if (!existing) throw new Error("WA Group card not found");

  const imageUrl = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );
  await prisma.waGroupCard.update({
    where: { id },
    data: { ...fields(formData), imageUrl: imageUrl ?? existing.imageUrl },
  });
  revalidateWaGroups();
  redirect("/admin/wa-groups");
}

export async function deleteWaGroupCard(formData: FormData) {
  await requirePermission("wa-groups", "delete");
  const id = String(formData.get("id") ?? "");
  await deleteIfExists(() => prisma.waGroupCard.delete({ where: { id } }));
  revalidateWaGroups();
}
