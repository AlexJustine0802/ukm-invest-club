"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

function revalidateDivisions() {
  revalidatePath("/about");
  revalidatePath("/admin/divisions");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function str(formData: FormData, key: string) {
  return (formData.get(key) as string)?.trim() || null;
}

// ---- Divisions ----

function divisionData(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  return {
    name,
    slug: str(formData, "slug") || slugify(name),
    tagline: str(formData, "tagline"),
    description: str(formData, "description"),
    icon: str(formData, "icon"),
    order: Number(formData.get("order")) || 0,
  };
}

export async function createDivision(formData: FormData) {
  await requireSession();
  const division = await prisma.division.create({ data: divisionData(formData) });
  revalidateDivisions();
  redirect(`/admin/divisions/${division.id}/edit`);
}

export async function updateDivision(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  await prisma.division.update({ where: { id }, data: divisionData(formData) });
  revalidateDivisions();
  redirect("/admin/divisions");
}

export async function deleteDivision(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  // Members cascade via the schema relation.
  await prisma.division.delete({ where: { id } });
  revalidateDivisions();
}

// Division people are User rows, edited in /admin/members — see
// app/admin/(dashboard)/members/actions.ts.
