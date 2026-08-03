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

/**
 * Flip the highlight switch on something that already exists.
 *
 * Only one banner fits on the dashboard, so switching a second thing on does
 * not hide the first  the newest simply wins, same as two active highlights.
 */
export async function setHighlighted(formData: FormData) {
  await requirePermission("highlights", "manage");
  const id = formData.get("id") as string;
  const highlighted = formData.get("highlighted") === "1";

  if (formData.get("kind") === "career") {
    await prisma.careerAlert.update({ where: { id }, data: { highlighted } });
  } else {
    await prisma.registrationForm.update({
      where: { id },
      data: { highlighted },
    });
  }

  revalidateHighlights();
  revalidatePath("/admin/career");
  revalidatePath("/admin/registrations");
}
