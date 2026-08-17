"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";
import { resolveImage } from "@/lib/upload";
import { slugify } from "@/lib/utils";
import { uniqueSlug } from "@/lib/slugs";
import { parseQuestions } from "@/lib/forms";
import type { Prisma } from "@prisma/client";

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

/**
 * The application form a posting owns.
 *
 * Postings do not pick an existing registration form  they carry their own
 * questions, and this writes them into a real RegistrationForm behind the
 * scenes. That way the member fill page, the responses table and the CSV
 * export all work on it exactly as they do for any other form, with nothing
 * new to maintain.
 *
 * Returns the form id to link, or null when the posting applies by link.
 */
async function syncApplyForm(
  formData: FormData,
  alert: { role: string; company: string },
  existingFormId: string | null,
): Promise<string | null> {
  if (formData.get("applyMethod") !== "form") return null;

  let raw: unknown = [];
  try {
    raw = JSON.parse((formData.get("applyQuestions") as string) || "[]");
  } catch {
    raw = [];
  }
  const questions = parseQuestions(raw).filter(
    (q) => q.label.trim() !== "",
  ) as unknown as Prisma.InputJsonValue;

  const title = `${alert.role}  ${alert.company}`;

  if (existingFormId) {
    // Renaming the posting renames its form; the slug stays put so a link
    // already shared keeps working.
    await prisma.registrationForm.update({
      where: { id: existingFormId },
      data: { title, questions },
    });
    return existingFormId;
  }

  const created = await prisma.registrationForm.create({
    data: {
      title,
      slug: await uniqueSlug(
        (slug) => prisma.registrationForm.findUnique({ where: { slug } }),
        slugify(title),
        "apply",
      ),
      description: `Application form for ${alert.role} at ${alert.company}.`,
      // Career alerts are a member-area page, so this is a members-only form.
      audience: "MEMBERS",
      questions,
      icon: "Briefcase",
      color: "green",
    },
    select: { id: true },
  });
  return created.id;
}

async function dataFrom(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string)?.trim() || null;
  const deadline = str("deadline");
  const viaForm = formData.get("applyMethod") === "form";

  return {
    company: (formData.get("company") as string).trim(),
    role: (formData.get("role") as string).trim(),
    location: str("location"),
    workType: str("workType") || "Internship",
    description: str("description"),
    // One route or the other, never both: whichever the radio did not choose
    // is cleared, so a stale link cannot outlive the switch to a form. The
    // form id is filled in by the caller, which owns creating it.
    applyUrl: viaForm ? null : str("applyUrl"),
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
  const data = await dataFrom(formData);
  const applyFormId = await syncApplyForm(formData, data, null);
  await prisma.careerAlert.create({ data: { ...data, applyFormId } });
  revalidateCareer();
  revalidatePath("/admin/registrations");
  redirect("/admin/career");
}

export async function updateCareerAlert(formData: FormData) {
  await requirePermission("career", "edit");
  const id = formData.get("id") as string;
  const data = await dataFrom(formData);

  // Switching to a link leaves the old form and its responses alone; only the
  // link between them goes.
  const existing = await prisma.careerAlert.findUnique({
    where: { id },
    select: { applyFormId: true },
  });
  const applyFormId = await syncApplyForm(
    formData,
    data,
    existing?.applyFormId ?? null,
  );

  await prisma.careerAlert.update({
    where: { id },
    data: { ...data, applyFormId },
  });
  revalidateCareer();
  revalidatePath("/admin/registrations");
  redirect("/admin/career");
}

export async function deleteCareerAlert(formData: FormData) {
  await requirePermission("career", "delete");
  const id = formData.get("id") as string;
  await deleteIfExists(() => prisma.careerAlert.delete({ where: { id } }));
  revalidateCareer();
}
