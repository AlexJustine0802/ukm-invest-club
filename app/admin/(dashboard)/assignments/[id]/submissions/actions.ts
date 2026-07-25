"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

function revalidateSubmission(assignmentId: string) {
  revalidatePath(`/admin/assignments/${assignmentId}/submissions`);
  revalidatePath(`/account/assignments/${assignmentId}`);
  revalidatePath("/account/assignments");
}

/**
 * Mark one submission. Setting gradedAt is what reveals the score to the member
 * and freezes their file.
 */
export async function gradeSubmission(formData: FormData) {
  await requireSession();

  const id = formData.get("id") as string;
  if (!id) return;

  const rawScore = ((formData.get("score") as string) ?? "").trim();
  const feedback = ((formData.get("feedback") as string) ?? "").trim() || null;

  // Blank score is allowed — feedback-only marking is still marking.
  let score: number | null = null;
  if (rawScore) {
    const parsed = Number(rawScore);
    if (!Number.isFinite(parsed)) return;
    score = Math.min(Math.max(Math.round(parsed), 0), 100);
  }

  const submission = await prisma.assignmentSubmission.update({
    where: { id },
    data: { score, feedback, gradedAt: new Date() },
    select: { assignmentId: true },
  });

  revalidateSubmission(submission.assignmentId);
}

/** Undo marking so the member can replace their file again. */
export async function unmarkSubmission(formData: FormData) {
  await requireSession();

  const id = formData.get("id") as string;
  if (!id) return;

  const submission = await prisma.assignmentSubmission.update({
    where: { id },
    data: { gradedAt: null },
    select: { assignmentId: true },
  });

  revalidateSubmission(submission.assignmentId);
}
