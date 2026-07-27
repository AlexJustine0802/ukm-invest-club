"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteIfExists } from "@/lib/deletes";
import { requirePermission } from "@/lib/adminAccess";
import { slugify } from "@/lib/utils";
import { uniqueSlug } from "@/lib/slugs";
import { parseQuestions, isAudience } from "@/lib/forms";
import { readEventDetails, syncEventForForm } from "@/lib/eventSync";

function revalidateForms(slug?: string) {
  revalidatePath("/admin/registrations");
  revalidatePath("/account/recruitment");
  revalidatePath("/admin/recruitment");
  revalidatePath("/register");
  // Public event cards link to a form, so their buttons depend on it existing.
  revalidatePath("/events");
  revalidatePath("/admin/events");
  revalidatePath("/account/events");
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
    registrationEnabled: formData.get("registrationEnabled") === "on",
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
  await requirePermission("registrations", "create");
  const data = dataFrom(formData);
  const details = readEventDetails(formData);

  // Two forms called "Tes" would collide on the unique slug and throw P2002
  // out of a form with nowhere to show it. Take the next free slug instead.
  const slug = await uniqueSlug(
    (s) => prisma.registrationForm.findUnique({ where: { slug: s } }),
    data.slug,
    "form",
  );

  // One transaction so a form is never left without the event it should own.
  await prisma.$transaction(async (tx) => {
    const created = await tx.registrationForm.create({
      data: { ...data, slug },
    });
    await syncEventForForm(tx, created, details);
  });

  revalidateForms(slug);
  redirect("/admin/registrations");
}

export async function updateRegistrationForm(formData: FormData) {
  await requirePermission("registrations", "edit");
  const id = formData.get("id") as string;
  const data = dataFrom(formData);
  const details = readEventDetails(formData);

  const existing = await prisma.registrationForm.findUnique({
    where: { id },
    select: { slug: true },
  });

  // ignoreId keeps this form's own slug free, so saving without renaming does
  // not bump it to "-2" every time.
  const slug = await uniqueSlug(
    (s) => prisma.registrationForm.findUnique({ where: { slug: s } }),
    data.slug,
    "form",
    id,
  );

  await prisma.$transaction(async (tx) => {
    const updated = await tx.registrationForm.update({
      where: { id },
      data: { ...data, slug },
    });
    await syncEventForForm(tx, updated, details);
  });

  revalidateForms(slug);
  if (existing && existing.slug !== slug) {
    revalidatePath(`/register/${existing.slug}`);
  }
  redirect("/admin/registrations");
}

export async function deleteRegistrationForm(formData: FormData) {
  await requirePermission("registrations", "delete");
  const id = formData.get("id") as string;
  // Event.registrationFormId cascades, so the public event goes with it.
  const form = await deleteIfExists(() =>
    prisma.registrationForm.delete({ where: { id } }),
  );
  // Already deleted: still refresh the list, which is what the caller wanted.
  if (!form) return revalidatePath("/admin/registrations");
  revalidateForms(form.slug);
}

/** Delete one submitted response  for spam or a duplicate someone asked to redo. */
export async function deleteResponse(formData: FormData) {
  await requirePermission("registrations", "delete");
  const id = formData.get("id") as string;
  const response = await deleteIfExists(() =>
    prisma.formResponse.delete({
      where: { id },
      select: { formId: true },
    }),
  );
  if (!response) return;
  revalidatePath(`/admin/registrations/${response.formId}/responses`);
}
