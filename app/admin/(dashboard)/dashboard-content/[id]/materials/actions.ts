"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";

function revalidateFolder(folderId: string) {
  revalidatePath(`/admin/dashboard-content/${folderId}/materials`);
  revalidatePath(`/account/resources/${folderId}`);
  revalidatePath("/account/resources");
}

export async function createResourceMaterial(formData: FormData) {
  await requirePermission("resource-materials","create");

  const str = (key: string) => (formData.get(key) as string)?.trim() || null;
  const folderId = formData.get("folderId") as string;

  await prisma.resourceMaterial.create({
    data: {
      folderId,
      title: (formData.get("title") as string).trim(),
      url: (formData.get("url") as string).trim(),
      description: str("description"),
      meta: str("meta"),
      order: Number(formData.get("order")) || 0,
    },
  });

  revalidateFolder(folderId);
}

export async function deleteResourceMaterial(formData: FormData) {
  await requirePermission("resource-materials","delete");

  const id = formData.get("id") as string;
  const material = await prisma.resourceMaterial.findUnique({
    where: { id },
    select: { folderId: true },
  });

  await deleteIfExists(() => prisma.resourceMaterial.delete({ where: { id } }));
  if (material) revalidateFolder(material.folderId);
}
