"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";
import { isBlobConfigured, uploadFile } from "@/lib/upload";
import { isOpen, isPastDue } from "@/lib/assignments";
import { formatDateTime } from "@/lib/utils";
import {
  MAX_SUBMISSION_MB,
  ALLOWED_SUBMISSION_EXTENSIONS,
  type SubmitState,
} from "@/lib/submissions";

/**
 * Hand in an assignment. Re-submitting replaces the previous file, but only
 * until the admin has marked it  after that the submission is frozen.
 */
export async function submitAssignment(
  _prev: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const session = await getUserSession();
  if (!session) return { error: "Please sign in again." };

  const assignmentId = formData.get("assignmentId") as string;
  if (!assignmentId) return { error: "Something went wrong. Reload the page." };

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { id: true, published: true, opensAt: true, dueDate: true },
  });
  if (!assignment || !assignment.published) {
    return { error: "This assignment is not available." };
  }
  // Checked here and not only in the page: hiding the upload box does not stop
  // a form post arriving early.
  if (!isOpen(assignment.opensAt)) {
    return {
      error: `This assignment opens on ${formatDateTime(assignment.opensAt!)}.`,
    };
  }
  // Same reason as the check above: the page hides the upload once the
  // deadline passes, but hiding a form does not stop a post from reaching here.
  if (isPastDue(assignment.dueDate)) {
    return {
      error: `The deadline passed on ${formatDateTime(assignment.dueDate)}. This assignment no longer accepts submissions.`,
    };
  }

  const existing = await prisma.assignmentSubmission.findUnique({
    where: { assignmentId_userId: { assignmentId, userId: session.userId } },
    select: { id: true, gradedAt: true, fileUrl: true, fileName: true },
  });
  if (existing?.gradedAt) {
    return { error: "This submission has been marked and can no longer be changed." };
  }

  const note = ((formData.get("note") as string) ?? "").trim() || null;
  const file = formData.get("file");

  let fileUrl = existing?.fileUrl ?? null;
  let fileName = existing?.fileName ?? null;

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_SUBMISSION_MB * 1024 * 1024) {
      return { error: `File must be ${MAX_SUBMISSION_MB} MB or smaller.` };
    }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!ALLOWED_SUBMISSION_EXTENSIONS.includes(ext)) {
      return {
        error: `That file type is not accepted. Allowed: ${ALLOWED_SUBMISSION_EXTENSIONS.join(", ")}.`,
      };
    }
    // Two different problems used to share one message, which sent people
    // chasing a config error when the upload had simply failed.
    if (!isBlobConfigured()) {
      return {
        error:
          "Error.",
      };
    }
    try {
      fileUrl = await uploadFile(file, "submissions");
      fileName = file.name;
    } catch (e) {
      console.error("[submitAssignment] upload failed", e);
      return {
        error: "The upload did not go through. Check your connection and try again.",
      };
    }
  }

  if (!fileUrl) return { error: "Please choose a file to upload." };

  await prisma.assignmentSubmission.upsert({
    where: { assignmentId_userId: { assignmentId, userId: session.userId } },
    create: { assignmentId, userId: session.userId, fileUrl, fileName, note },
    update: { fileUrl, fileName, note, submittedAt: new Date() },
  });

  revalidatePath(`/account/assignments/${assignmentId}`);
  revalidatePath("/account/assignments");
  revalidatePath(`/admin/assignments/${assignmentId}/submissions`);
  return { ok: true };
}

/** Withdraw a submission before it is marked. */
export async function withdrawSubmission(formData: FormData) {
  const session = await getUserSession();
  if (!session) return;

  const assignmentId = formData.get("assignmentId") as string;
  if (!assignmentId) return;

  // Withdrawing after the deadline would delete the only submission the member
  // can no longer replace, so the window closes with the deadline.
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    select: { dueDate: true },
  });
  if (!assignment || isPastDue(assignment.dueDate)) return;

  await prisma.assignmentSubmission.deleteMany({
    where: { assignmentId, userId: session.userId, gradedAt: null },
  });

  revalidatePath(`/account/assignments/${assignmentId}`);
  revalidatePath("/account/assignments");
  revalidatePath(`/admin/assignments/${assignmentId}/submissions`);
}
