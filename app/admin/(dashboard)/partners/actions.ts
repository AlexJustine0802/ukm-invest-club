"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";
import { resolveImage } from "@/lib/upload";
import { toPartnerCategory } from "@/lib/partners";

function revalidatePartners() {
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/partners");
}

export async function createPartner(formData: FormData) {
  await requirePermission("partners", "create");
  const logoUrl = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );
  await prisma.partner.create({
    data: {
      name: (formData.get("name") as string).trim(),
      logoUrl,
      order: Number(formData.get("order")) || 0,
      // Validated rather than trusted: this arrives from a client form.
      category: toPartnerCategory(formData.get("category") as string),
    },
  });
  revalidatePartners();
  redirect("/admin/partners");
}

export async function updatePartner(formData: FormData) {
  await requirePermission("partners", "edit");
  const id = formData.get("id") as string;
  const existing = await prisma.partner.findUnique({ where: { id } });
  if (!existing) throw new Error("Partner not found");

  const resolved = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );
  await prisma.partner.update({
    where: { id },
    data: {
      name: (formData.get("name") as string).trim(),
      logoUrl: resolved ?? existing.logoUrl,
      order: Number(formData.get("order")) || 0,
      category: toPartnerCategory(formData.get("category") as string),
    },
  });
  revalidatePartners();
  redirect("/admin/partners");
}

export async function deletePartner(formData: FormData) {
  await requirePermission("partners", "delete");
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.partner.delete({ where: { id } }));
  revalidatePartners();
}
