"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";
import { resolveImage } from "@/lib/upload";

function revalidateCareer() {
  revalidatePath("/admin/career");
  revalidatePath("/account/career");
  revalidatePath("/account/announcements");
  revalidatePath("/admin/announcements");
  revalidatePath("/admin/highlights");
  // The notification bell reads career alerts, and it renders on every member
  // page  so a new posting has to invalidate the whole member area.
  revalidatePath("/account", "layout");
}

async function dataFrom(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string)?.trim() || null;
  const deadline = str("deadline");

  return {
    company: (formData.get("company") as string).trim(),
    role: (formData.get("role") as string).trim(),
    location: str("location"),
    workType: str("workType") || "Internship",
    description: str("description"),
    applyUrl: str("applyUrl"),
    deadline: deadline ? new Date(deadline) : null,
    // Uploaded file wins over a pasted URL; null clears the logo.
    logo: await resolveImage(
      formData.get("imageFile") as File | null,
      formData.get("imageUrl") as string | null,
    ),
    companyIndustry: str("companyIndustry"),
    companySize: str("companySize"),
    companyWebsite: str("companyWebsite"),
    companyProfile: str("companyProfile"),
    published: formData.get("published") === "on",
    announced: formData.get("announced") === "on",
    highlighted: formData.get("highlighted") === "on",
  };
}

export async function createCareerAlert(formData: FormData) {
  await requirePermission("career", "create");
  await prisma.careerAlert.create({ data: await dataFrom(formData) });
  revalidateCareer();
  redirect("/admin/career");
}

export async function updateCareerAlert(formData: FormData) {
  await requirePermission("career", "edit");
  const id = formData.get("id") as string;
  await prisma.careerAlert.update({ where: { id }, data: await dataFrom(formData) });
  revalidateCareer();
  redirect("/admin/career");
}

export async function deleteCareerAlert(formData: FormData) {
  await requirePermission("career", "delete");
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.careerAlert.delete({ where: { id } }));
  revalidateCareer();
}
