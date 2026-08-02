"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";

function revalidateAssignments() {
  revalidatePath("/account/assignments");
  revalidatePath("/account");
  revalidatePath("/admin/assignments");
}

/**
 * Only the fields the form still asks for. Category, work type, status, icon,
 * colour and order are left to the column defaults on create and untouched on
 * update  see the note in components/admin/AssignmentForm.
 */
function dataFrom(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string)?.trim() || null;

  // The tickbox decides; a date left in the field without it is ignored, so an
  // admin who unticks the box reopens the assignment in one click.
  const opensAtRaw = str("opensAt");
  const opensAt =
    formData.get("hasOpenDate") && opensAtRaw ? new Date(opensAtRaw) : null;

  return {
    title: (formData.get("title") as string).trim(),
    description: str("description"),
    opensAt,
    dueDate: new Date(formData.get("dueDate") as string),
    href: str("href"),
    published: formData.get("published") === "on",
  };
}

export async function createAssignment(formData: FormData) {
  await requirePermission("assignments", "create");
  await prisma.assignment.create({ data: dataFrom(formData) });
  revalidateAssignments();
  redirect("/admin/assignments");
}

export async function updateAssignment(formData: FormData) {
  await requirePermission("assignments", "edit");
  const id = formData.get("id") as string;
  await prisma.assignment.update({ where: { id }, data: dataFrom(formData) });
  revalidateAssignments();
  redirect("/admin/assignments");
}

export async function deleteAssignment(formData: FormData) {
  await requirePermission("assignments", "delete");
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.assignment.delete({ where: { id } }));
  revalidateAssignments();
}
