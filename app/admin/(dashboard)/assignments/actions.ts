"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requireSession } from "@/lib/auth";
import { ASSIGNMENT_STATUSES } from "@/lib/assignments";

function revalidateAssignments() {
  revalidatePath("/account/assignments");
  revalidatePath("/account");
  revalidatePath("/admin/assignments");
}

function dataFrom(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string)?.trim() || null;
  const rawStatus = formData.get("status") as string;

  return {
    title: (formData.get("title") as string).trim(),
    category: (formData.get("category") as string).trim(),
    workType: (formData.get("workType") as string)?.trim() || "Individual",
    description: str("description"),
    dueDate: new Date(formData.get("dueDate") as string),
    status: ASSIGNMENT_STATUSES.includes(rawStatus as never)
      ? rawStatus
      : "ACTIVE",
    icon: str("icon"),
    color: str("color"),
    href: str("href"),
    order: Number(formData.get("order")) || 0,
    published: formData.get("published") === "on",
  };
}

export async function createAssignment(formData: FormData) {
  await requireSession();
  await prisma.assignment.create({ data: dataFrom(formData) });
  revalidateAssignments();
  redirect("/admin/assignments");
}

export async function updateAssignment(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  await prisma.assignment.update({ where: { id }, data: dataFrom(formData) });
  revalidateAssignments();
  redirect("/admin/assignments");
}

export async function deleteAssignment(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.assignment.delete({ where: { id } }));
  revalidateAssignments();
}
