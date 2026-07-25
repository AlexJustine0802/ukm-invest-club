"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { parseQuestions, isAudience } from "@/lib/forms";

function revalidateForms(slug?: string) {
  revalidatePath("/admin/registrations");
  revalidatePath("/account/registrations");
  revalidatePath("/account/recruitment");
  revalidatePath("/admin/recruitment");
  revalidatePath("/register");
  // Public event cards link to a form, so their buttons depend on it existing.
  revalidatePath("/events");
  if (slug) revalidatePath(`/register/${slug}`);
}

function dataFrom(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string)?.trim() || null;
  const title = (formData.get("title") as string).trim();
  const audience = (formData.get("audience") as string) ?? "MEMBERS";
  const opensAt = str("opensAt");
  const closesAt = str("closesAt");
  const capacity = str("capacity");

  // The builder posts its state as JSON; parseQuestions drops anything malformed.
  let questions: unknown = [];
  try {
    questions = JSON.parse((formData.get("questions") as string) || "[]");
  } catch {
    questions = [];
  }

  return {
    title,
    slug: slugify(str("slug") || title),
    description: str("description"),
    coverImage: str("coverImage"),
    audience: isAudience(audience) ? audience : "MEMBERS",
    multipleResponses: formData.get("multipleResponses") === "on",
    isRecruitment: formData.get("isRecruitment") === "on",
    // Prisma types Json columns structurally; our typed array needs the cast.
    questions: parseQuestions(questions).filter(
      (q) => q.label.trim() !== "",
    ) as unknown as Prisma.InputJsonValue,
    opensAt: opensAt ? new Date(opensAt) : null,
    closesAt: closesAt ? new Date(closesAt) : null,
    capacity: capacity ? Number(capacity) || null : null,
    published: formData.get("published") === "on",
    order: Number(formData.get("order")) || 0,
    icon: str("icon"),
    color: str("color"),
  };
}

export async function createRegistrationForm(formData: FormData) {
  await requireSession();
  const data = dataFrom(formData);
  await prisma.registrationForm.create({ data });
  revalidateForms(data.slug);
  redirect("/admin/registrations");
}

export async function updateRegistrationForm(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  const data = dataFrom(formData);
  const existing = await prisma.registrationForm.findUnique({
    where: { id },
    select: { slug: true },
  });
  await prisma.registrationForm.update({ where: { id }, data });
  revalidateForms(data.slug);
  if (existing && existing.slug !== data.slug) {
    revalidatePath(`/register/${existing.slug}`);
  }
  redirect("/admin/registrations");
}

export async function deleteRegistrationForm(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  const form = await prisma.registrationForm.delete({ where: { id } });
  revalidateForms(form.slug);
}

/** Delete one submitted response — for spam or a duplicate someone asked to redo. */
export async function deleteResponse(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  const response = await prisma.formResponse.delete({
    where: { id },
    select: { formId: true },
  });
  revalidatePath(`/admin/registrations/${response.formId}/responses`);
  revalidatePath("/account/registrations");
}
