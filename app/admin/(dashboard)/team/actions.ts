"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { resolveImage } from "@/lib/upload";

function revalidateTeam() {
  revalidatePath("/about");
  revalidatePath("/");
  revalidatePath("/admin/team");
}

function parseFields(formData: FormData) {
  return {
    name: (formData.get("name") as string).trim(),
    role: (formData.get("role") as string).trim(),
    bio: (formData.get("bio") as string)?.trim() || null,
    order: Number(formData.get("order")) || 0,
    linkedin: (formData.get("linkedin") as string)?.trim() || null,
    instagram: (formData.get("instagram") as string)?.trim() || null,
  };
}

export async function createTeamMember(formData: FormData) {
  await requireSession();
  const photo = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );
  await prisma.teamMember.create({
    data: { ...parseFields(formData), photo },
  });
  revalidateTeam();
  redirect("/admin/team");
}

export async function updateTeamMember(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  const photo = await resolveImage(
    formData.get("imageFile") as File | null,
    formData.get("imageUrl") as string | null,
  );
  await prisma.teamMember.update({
    where: { id },
    data: { ...parseFields(formData), photo },
  });
  revalidateTeam();
  redirect("/admin/team");
}

export async function deleteTeamMember(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  await prisma.teamMember.delete({ where: { id } });
  revalidateTeam();
}
