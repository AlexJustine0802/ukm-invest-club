"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  clearUserSessionCookie,
  getUserSession,
  type UserSession,
} from "@/lib/userAuth";
import { uploadFile } from "@/lib/upload";
import { sendRegistrationConfirmationEmail } from "@/lib/email";
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

function registrationError(stage: string, formId: string, error: unknown) {
  const details =
    error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : { message: String(error) };

  // Do not include FormData or answers here: submissions can contain personal
  // information. The stage and form id are enough to find the failing query in
  // Vercel's function logs.
  console.error("[registration] submit failed", { stage, formId, ...details });
}

const databaseError =
  "The registration could not be saved right now. Please wait a moment and try again.";

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

  let form;
  try {
    form = await prisma.registrationForm.findUnique({
      where: { id: formId },
      include: { _count: { select: { responses: true } } },
    });
  } catch (error) {
    registrationError("load-form", formId, error);
    return { error: databaseError };
  }
  if (!form) return { error: "This registration no longer exists." };

  const status = formStatus(form);
  if (status === "hidden") return { error: "This registration is not available." };
  if (status === "not-yet") return { error: "This registration has not opened yet." };
  if (status === "closed") return { error: "This registration is closed." };

  if (form.capacity !== null && form._count.responses >= form.capacity) {
    return { error: "This registration is already full." };
  }

  let session: UserSession | null;
  try {
    session = await getUserSession();
  } catch (error) {
    registrationError("load-session", formId, error);
    return { error: databaseError };
  }

  // A JWT can outlive the database row it refers to (for example after a
  // database was replaced or a member was removed). Never pass that stale id
  // into FormResponse.userId: Postgres correctly rejects it with a foreign-key
  // error. Treat it as a logged-out visitor for public forms and clear the
  // cookie so the next request cannot repeat the failure.
  let staleSession = false;
  if (session) {
    try {
      const member = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true },
      });
      if (!member) {
        await clearUserSessionCookie();
        session = null;
        staleSession = true;
      }
    } catch (error) {
      registrationError("validate-session-user", formId, error);
      return { error: databaseError };
    }
  }
  if (staleSession) {
    // The cookie has already been removed. Reload the same form so a public
    // form can be submitted normally; a members-only form will show its
    // normal sign-in prompt instead of an error banner.
    const basePath =
      formData.get("basePath") === "/account/register"
        ? "/account/register"
        : "/register";
    redirect(`${basePath}/${form.slug}`);
  }
  if (session && !allowsMembers(form.audience)) {
    return { error: "This registration is not open to member accounts." };
  }
  if (!session && !allowsGuests(form.audience)) {
    return { error: "Please sign in to your member account to register." };
  }

  // The email question is the only contact field for both public and member
  // forms. Public submissions no longer have a separate guest-details block.
  let guestName: string | null = null;
  let guestEmail: string | null = null;
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
        } catch (error) {
          registrationError("upload-file", formId, error);
          return {
            error:
              "The file could not be uploaded. Please try again or contact the administrator.",
          };
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
      if (q.type === "EMAIL" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
        return { error: `“${q.label}” must be a valid email address.` };
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

  // The first Email question identifies a public responder for duplicate
  // checks and for the response row. All Email questions are still sent the
  // configured confirmation below.
  const recipientEmails = new Set<string>();
  const collectEmailQuestions = (list: FormQuestion[]) => {
    for (const q of list) {
      if (q.type === "EMAIL") {
        const answer = answers[q.id];
        if (typeof answer === "string") recipientEmails.add(answer.toLowerCase());
      }
      for (const branch of Object.values(q.branches ?? {})) {
        collectEmailQuestions(branch);
      }
    }
  };
  collectEmailQuestions(questions);
  guestEmail = [...recipientEmails][0] ?? null;

  // One response per person unless the admin allowed repeats. Public forms
  // can only use this check when they contain an Email question.
  if (!form.multipleResponses && (session || guestEmail)) {
    let existing;
    try {
      existing = await prisma.formResponse.findFirst({
        where: session
          ? { formId, userId: session.userId }
          : { formId, guestEmail },
        select: { id: true },
      });
    } catch (error) {
      registrationError("check-duplicate", formId, error);
      return { error: databaseError };
    }
    if (existing) return { error: "You have already submitted this form." };
  }

  try {
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
  } catch (error) {
    registrationError("save-response", formId, error);
    return { error: databaseError };
  }

  // A signed-in member filling an event's form is registering for that event,
  // so record it too  that is what the seat counter and the "Registration"
  // tab on /account/events read.
  if (session) {
    try {
      const events = await prisma.event.findMany({
        where: { registrationFormId: formId },
        select: { id: true },
      });
      for (const event of events) {
        await prisma.eventRegistration
          .create({ data: { eventId: event.id, userId: session.userId } })
          .catch((error) => {
            // A duplicate is harmless; other failures still need to be visible.
            registrationError("save-event-registration", formId, error);
          });
      }
      if (events.length) revalidatePath("/account/events");
    } catch (error) {
      // The form response is already safely stored. Do not turn an auxiliary
      // event-sync failure into a failed registration.
      registrationError("sync-event-registration", formId, error);
    }

  }

  // Email questions are the source of truth for notification recipients. This
  // runs for both public and member submissions, and supports email questions
  // inside dropdown branches as well.
  const emailSubject = form.emailSubject?.trim();
  const emailBody = form.emailBody?.trim();
  if (emailSubject && emailBody && recipientEmails.size > 0) {
    for (const email of recipientEmails) {
      try {
        await sendRegistrationConfirmationEmail({
          to: email,
          recipientName: session?.email === email ? "Member" : guestName ?? "Participant",
          formTitle: form.title,
          subject: emailSubject,
          body: emailBody,
        });
      } catch (error) {
        // The registration is already saved. Do not make a user submit twice
        // because an external email provider is temporarily unavailable.
        console.error("[registration] confirmation email failed", error);
      }
    }
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
