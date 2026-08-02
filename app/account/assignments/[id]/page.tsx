import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
} from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import SubmitAssignmentForm from "@/components/account/SubmitAssignmentForm";
import { dueLabel, isDueSoon, isOpen, memberState } from "@/lib/assignments";
import { formatDateTime } from "@/lib/utils";
import { withdrawSubmission } from "./actions";

export const metadata: Metadata = { title: "Assignment" };
export const dynamic = "force-dynamic";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const { id } = await params;
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment || !assignment.published) notFound();

  const submission = await prisma.assignmentSubmission.findUnique({
    where: { assignmentId_userId: { assignmentId: id, userId: user.id } },
  });

  const now = new Date();
  const open = isOpen(assignment.opensAt, now);
  const overdue = assignment.dueDate < now;
  const soon = isDueSoon(
    assignment.dueDate,
    memberState(assignment.opensAt, submission, now),
    now,
  );
  const graded = Boolean(submission?.gradedAt);

  return (
    <>
      <Link
        href="/account/assignments"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assignments
      </Link>

      <AccountTopBar
        title={assignment.title}
        subtitle={dueLabel(assignment.dueDate, now)}
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Brief */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-4">
              {/* One icon for every assignment  there is nothing to pick. */}
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
                <ClipboardList className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-navy">{assignment.title}</h2>
                  {soon && !submission && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                      Due soon
                    </span>
                  )}
                  {overdue && !submission && (
                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                      Overdue
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span
                    className={`flex items-center gap-1.5 font-semibold ${
                      overdue ? "text-rose-600" : soon ? "text-amber-600" : "text-slate-500"
                    }`}
                  >
                    <CalendarClock className="h-3.5 w-3.5" />
                    {dueLabel(assignment.dueDate, now)}
                  </span>
                </div>
              </div>
            </div>

            {assignment.description && (
              <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {assignment.description}
              </p>
            )}

            {assignment.href && (
              <a
                href={assignment.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                Open the brief / template
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </section>

          {/* Submit */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-bold text-navy">
              {graded ? "Your submission" : submission ? "Your submission" : "Submit your work"}
            </h3>

            {submission && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <FileText className="h-5 w-5 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-navy">
                    {submission.fileName ?? "Uploaded file"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Submitted {formatDateTime(submission.submittedAt)}
                  </p>
                </div>
                {submission.fileUrl && (
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-navy hover:bg-slate-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                )}
              </div>
            )}

            {submission?.note && (
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                {submission.note}
              </p>
            )}

            {!open ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4 text-amber-600" />
                Opens {formatDateTime(assignment.opensAt!)} — you can read the
                brief now and submit once it opens.
              </p>
            ) : graded ? (
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Marked  your submission is locked.
              </p>
            ) : (
              <div className="mt-5">
                <SubmitAssignmentForm
                  assignmentId={assignment.id}
                  hasSubmission={Boolean(submission)}
                  note={submission?.note ?? null}
                />
                {submission && (
                  <form action={withdrawSubmission} className="mt-3">
                    <input type="hidden" name="assignmentId" value={assignment.id} />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-slate-500 underline hover:text-rose-600"
                    >
                      Withdraw submission
                    </button>
                  </form>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Status / result */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-bold text-navy">Status</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Submission</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    submission
                      ? "bg-emerald-50 text-emerald-700"
                      : overdue
                        ? "bg-rose-50 text-rose-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {submission ? "Submitted" : overdue ? "Missing" : "Not yet"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Marked</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    graded ? "bg-blue-50 text-primary" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {graded ? "Yes" : "Waiting"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Deadline</span>
                <span className="text-right text-xs font-semibold text-navy">
                  {formatDateTime(assignment.dueDate)}
                </span>
              </div>
            </div>
          </section>

          <section
            className={`rounded-2xl border p-5 ${
              graded ? "border-primary/30 bg-blue-50/50" : "border-slate-200 bg-white"
            }`}
          >
            <h3 className="flex items-center gap-2 font-bold text-navy">
              <GraduationCap className="h-4 w-4 text-primary" />
              Result
            </h3>
            {graded ? (
              <>
                {submission!.score !== null && (
                  <p className="mt-3 text-4xl font-bold text-navy">
                    {submission!.score}
                    <span className="text-base font-semibold text-slate-400"> / 100</span>
                  </p>
                )}
                {submission!.feedback && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                    {submission!.feedback}
                  </p>
                )}
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  Marked {formatDateTime(submission!.gradedAt!)}
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Your score and feedback appear here once the committee has
                reviewed your work.
              </p>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
