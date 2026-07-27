"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";

function revalidateHighlights() {
  revalidatePath("/account");
  revalidatePath("/admin/highlights");
}

function dataFrom(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string)?.trim() || null;
  return {
    eyebrow: (formData.get("eyebrow") as string).trim(),
    title: (formData.get("title") as string).trim(),
    description: str("description"),
    buttonLabel: str("buttonLabel"),
    buttonHref: str("buttonHref"),
    noteTitle: str("noteTitle"),
    noteBody: str("noteBody"),
    active: formData.get("active") === "on",
  };
}

export async function createHighlight(formData: FormData) {
  await requirePermission("highlights", "create");
  await prisma.highlight.create({ data: dataFrom(formData) });
  revalidateHighlights();
  redirect("/admin/highlights");
}

export async function updateHighlight(formData: FormData) {
  await requirePermission("highlights", "edit");
  const id = formData.get("id") as string;
  await prisma.highlight.update({ where: { id }, data: dataFrom(formData) });
  revalidateHighlights();
  redirect("/admin/highlights");
}

export async function deleteHighlight(formData: FormData) {
  await requirePermission("highlights", "delete");
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.highlight.delete({ where: { id } }));
  revalidateHighlights();
}
