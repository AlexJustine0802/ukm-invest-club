"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";
import { uploadFile } from "@/lib/upload";
import {
  parseQuestions,
  formStatus,
  allowsGuests,
  allowsMembers,
  CHOICE_TYPES,
  DEFAULT_MAX_MB,
  type FormAnswers,
  type FormQuestion,
} from "@/lib/forms";

export interface SubmitState {
  error?: string;
}

/**
 * Handle one registration submission. Everything the page checked before
 * rendering is re-checked here  the page is UI, this is the trust boundary.
 */
export async function submitRegistration(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const formId = formData.get("formId") as string;
  if (!formId) return { error: "Something went wrong. Please reload the page." };

  const form = await prisma.registrationForm.findUnique({
    where: { id: formId },
    include: { _count: { select: { responses: true } } },
  });
  if (!form) return { error: "This registration no longer exists." };

  const status = formStatus(form);
  if (status === "hidden") return { error: "This registration is not available." };
  if (status === "not-yet") return { error: "This registration has not opened yet." };
  if (status === "closed") return { error: "This registration is closed." };

  if (form.capacity !== null && form._count.responses >= form.capacity) {
    return { error: "This registration is already full." };
  }

  const session = await getUserSession();
  if (session && !allowsMembers(form.audience)) {
    return { error: "This registration is not open to member accounts." };
  }
  if (!session && !allowsGuests(form.audience)) {
    return { error: "Please sign in to your member account to register." };
  }

  // Guests identify themselves; members are already identified.
  let guestName: string | null = null;
  let guestEmail: string | null = null;
  if (!session) {
    guestName = ((formData.get("guestName") as string) ?? "").trim() || null;
    guestEmail = ((formData.get("guestEmail") as string) ?? "").trim() || null;
    if (!guestName || !guestEmail) {
      return { error: "Please fill in your name and email." };
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(guestEmail)) {
      return { error: "Please enter a valid email address." };
    }
  }

  // One response per person unless the admin allowed repeats.
  if (!form.multipleResponses) {
    const existing = await prisma.formResponse.findFirst({
      where: session
        ? { formId, userId: session.userId }
        : { formId, guestEmail },
      select: { id: true },
    });
    if (existing) return { error: "You have already submitted this form." };
  }

  const questions = parseQuestions(form.questions);
  const answers: FormAnswers = {};

  // Walks the questions the same way the form renders them: a branch is only
  // read when its option was the one picked, so a required follow-up on a path
  // nobody took cannot block the submission.
  const collect = async (
    list: FormQuestion[],
  ): Promise<SubmitState | null> => {
    for (const q of list) {
      const key = `q_${q.id}`;

      // Not a question, just where one section ends and the next begins.
      if (q.type === "PAGE_BREAK") continue;

      if (q.type === "FILE") {
        const file = formData.get(key);
        if (!(file instanceof File) || file.size === 0) {
          if (q.required) return { error: `“${q.label}” needs a file.` };
          continue;
        }
        const maxMb = q.maxMb ?? DEFAULT_MAX_MB;
        if (file.size > maxMb * 1024 * 1024) {
          return { error: `“${q.label}”: file must be ${maxMb} MB or smaller.` };
        }
        try {
          answers[q.id] = await uploadFile(file, "form-uploads");
        } catch {
          return { error: "ERROR" };
        }
        continue;
      }

      if (q.type === "CHECKBOX") {
        const picked = formData
          .getAll(key)
          .map((v) => String(v))
          .filter((v) => (q.options ?? []).includes(v));
        if (q.required && picked.length === 0) {
          return { error: `“${q.label}” needs at least one answer.` };
        }
        if (picked.length) answers[q.id] = picked;
        continue;
      }

      const value = ((formData.get(key) as string) ?? "").trim();
      if (!value) {
        if (q.required) return { error: `“${q.label}” is required.` };
        continue;
      }
      if (CHOICE_TYPES.includes(q.type) && !(q.options ?? []).includes(value)) {
        return { error: `“${q.label}”: pick one of the given options.` };
      }
      answers[q.id] = value;

      // Only the branch belonging to the answer given is asked for.
      const branch = q.branches?.[value];
      if (branch) {
        const failed = await collect(branch);
        if (failed) return failed;
      }
    }
    return null;
  };

  const invalid = await collect(questions);
  if (invalid) return invalid;

  await prisma.formResponse.create({
    data: {
      formId,
      userId: session?.userId ?? null,
      guestName,
      guestEmail,
      // Prisma types Json columns structurally; FormAnswers needs the cast.
      answers: answers as unknown as Prisma.InputJsonValue,
    },
  });

  // A signed-in member filling an event's form is registering for that event,
  // so record it too  that is what the seat counter and the "Registration"
  // tab on /account/events read.
  if (session) {
    const events = await prisma.event.findMany({
      where: { registrationFormId: formId },
      select: { id: true },
    });
    for (const event of events) {
      await prisma.eventRegistration
        .create({ data: { eventId: event.id, userId: session.userId } })
        .catch(() => {
          // Unique constraint  already registered, nothing to do.
        });
    }
    if (events.length) revalidatePath("/account/events");
  }

  // Members fill the form inside the member area; sending them back to the
  // public page afterwards would drop them out of it. Only the two known
  // areas are accepted, so the field cannot redirect anywhere else.
  const basePath =
    formData.get("basePath") === "/account/register"
      ? "/account/register"
      : "/register";

  revalidatePath(`/register/${form.slug}`);
  revalidatePath(`/account/register/${form.slug}`);
  revalidatePath(`/admin/registrations/${form.id}/responses`);
  redirect(`${basePath}/${form.slug}?done=1`);
}
