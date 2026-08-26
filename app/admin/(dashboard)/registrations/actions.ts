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
import { resolveImage } from "@/lib/upload";
import { parseWallClockDateTime } from "@/lib/wallClock";

function revalidateForms(slug?: string) {
  revalidatePath("/admin/registrations");
  revalidatePath("/account/recruitment");
  revalidatePath("/admin/recruitment");
  revalidatePath("/register");
  // Public event cards link to a form, so their buttons depend on it existing.
  revalidatePath("/events");
  revalidatePath("/admin/events");
  revalidatePath("/account/events");
  revalidatePath("/account/announcements");
  revalidatePath("/admin/announcements");
  revalidatePath("/admin/highlights");
  if (slug) revalidatePath(`/register/${slug}`);
}

/**
 * Icon and colour are not asked for any more: what a form is already decides
 * how it should look, and three kinds of form with a free choice each only
 * produced inconsistent lists.
 */
function styleFor(isRecruitment: boolean, isEvent: boolean) {
  if (isEvent) return { icon: "CalendarDays", color: "blue" };
  if (isRecruitment) return { icon: "Search", color: "violet" };
  return { icon: "FileSpreadsheet", color: "green" };
}

function dataFrom(formData: FormData) {
  const str = (key: string) => (formData.get(key) as string)?.trim() || null;
  const title = (formData.get("title") as string).trim();
  const audience = (formData.get("audience") as string) ?? "MEMBERS";
  const opensAt = str("opensAt");
  const closesAt = str("closesAt");
  const capacity = str("capacity");
  const emailSubject = str("emailSubject");
  const emailBody = str("emailBody");

  // The builder posts its state as JSON; parseQuestions drops anything malformed.
  let questions: unknown = [];
  try {
    questions = JSON.parse((formData.get("questions") as string) || "[]");
  } catch {
    questions = [];
  }

  const isRecruitment = formData.get("isRecruitment") === "on";

  return {
    title,
    // Made from the title; uniqueSlug below settles collisions. The admin form
    // no longer asks for one.
    slug: slugify(title),
    description: str("description"),
    coverImage: str("coverImage"),
    audience: isAudience(audience) ? audience : "MEMBERS",
    multipleResponses: formData.get("multipleResponses") === "on",
    isRecruitment,
    announced: formData.get("announced") === "on",
    highlighted: formData.get("highlighted") === "on",
    registrationEnabled: formData.get("registrationEnabled") === "on",
    // Prisma types Json columns structurally; our typed array needs the cast.
    questions: parseQuestions(questions).filter(
      (q) => q.label.trim() !== "",
    ) as unknown as Prisma.InputJsonValue,
    opensAt: opensAt ? parseWallClockDateTime(opensAt) : null,
    closesAt: closesAt ? parseWallClockDateTime(closesAt) : null,
    capacity: capacity ? Number(capacity) || null : null,
    emailSubject,
    emailBody,
    published: formData.get("published") === "on",
    ...styleFor(isRecruitment, Boolean(formData.get("showOnEvents"))),
  };
}

/**
 * Add an event category from the event form's dialog.
 *
 * Guarded by event-categories, not registrations: the category shows up on the
 * public events page, so it is that module's permission to give.
 */
export async function createEventCategoryInline(
  title: string,
): Promise<{ value: string; label: string } | { error: string }> {
  await requirePermission("event-categories", "create");

  const clean = title.trim();
  if (!clean) return { error: "Give the category a name." };

  const existing = await prisma.eventCategory.findFirst({
    where: { title: clean },
    select: { id: true, title: true },
  });
  const category =
    existing ??
    (await prisma.eventCategory.create({
      data: {
        title: clean,
        slug: await uniqueSlug(
          (s) => prisma.eventCategory.findUnique({ where: { slug: s } }),
          slugify(clean),
          "category",
        ),
      },
      select: { id: true, title: true },
    }));

  revalidatePath("/events");
  revalidatePath("/admin/event-categories");
  return { value: category.id, label: category.title };
}

export async function createRegistrationForm(formData: FormData) {
  await requirePermission("registrations", "create");
  const data = {
    ...dataFrom(formData),
    coverImage: await resolveImage(
      formData.get("coverImageFile") as File | null,
      formData.get("coverImage") as string | null,
    ),
  };
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
  const data = {
    ...dataFrom(formData),
    coverImage: await resolveImage(
      formData.get("coverImageFile") as File | null,
      formData.get("coverImage") as string | null,
    ),
  };
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
