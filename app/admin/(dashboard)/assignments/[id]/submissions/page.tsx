import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SubmitButton from "@/components/admin/SubmitButton";
import { divisionName } from "@/lib/roles";
import { formatDateTime } from "@/lib/utils";
import { gradeSubmission, unmarkSubmission } from "./actions";
import { requirePage } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("assignments", "approve");

  const { id } = await params;

  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      submissions: {
        orderBy: [{ gradedAt: "asc" }, { submittedAt: "asc" }],
        include: {
          user: { select: { name: true, email: true, role: true, division: true } },
        },
      },
    },
  });
  if (!assignment) notFound();

  const graded = assignment.submissions.filter((s) => s.gradedAt);
  const pending = assignment.submissions.filter((s) => !s.gradedAt);
  const scores = graded
    .map((s) => s.score)
    .filter((s): s is number => s !== null);
  const average =
    scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
      : null;

  return (
    <div>
      <Link href="/admin/assignments" className="text-sm text-accent-dark hover:text-accent">
        ← Back to assignments
      </Link>

      <h1 className="mt-2 text-2xl font-bold text-navy">{assignment.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {assignment.category} · {assignment.workType} · due{" "}
        {formatDateTime(assignment.dueDate)}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Submissions", value: assignment.submissions.length },
          { label: "Waiting to mark", value: pending.length },
          { label: "Average score", value: average === null ? "" : `${average} / 100` },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-navy">{stat.value}</p>
          </div>
        ))}
      </div>

      {assignment.submissions.length === 0 ? (
        <p className="mt-8 text-slate-500">Nobody has submitted yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {assignment.submissions.map((s) => {
            const isGraded = Boolean(s.gradedAt);
            const late = s.submittedAt > assignment.dueDate;
            return (
              <div key={s.id} className="card p-4">
                <div className="flex flex-wrap items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-base font-bold text-primary">
                    {s.user.name.charAt(0).toUpperCase()}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-navy">{s.user.name}</p>
                      {isGraded ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          Marked{s.score !== null ? ` · ${s.score}/100` : ""}
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          Needs marking
                        </span>
                      )}
                      {late && (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                          Late
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {s.user.email}
                      {divisionName(s.user.division)
                        ? ` · ${divisionName(s.user.division)}`
                        : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Submitted {formatDateTime(s.submittedAt)}
                      {isGraded ? ` · marked ${formatDateTime(s.gradedAt!)}` : ""}
                    </p>
                    {s.note && (
                      <p className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-2.5 text-sm text-slate-600">
                        {s.note}
                      </p>
                    )}
                  </div>

                  {s.fileUrl && (
                    <a
                      href={s.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      ⬇ {s.fileName ?? "Download"}
                    </a>
                  )}
                </div>

                {/* Marking */}
                <form
                  action={gradeSubmission}
                  className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4"
                >
                  <input type="hidden" name="id" value={s.id} />
                  <div className="w-28">
                    <label className="label" htmlFor={`score-${s.id}`}>
                      Score
                    </label>
                    <input
                      id={`score-${s.id}`}
                      name="score"
                      type="number"
                      min={0}
                      max={100}
                      defaultValue={s.score ?? ""}
                      placeholder="0–100"
                      className="input"
                    />
                  </div>
                  <div className="min-w-[220px] flex-1">
                    <label className="label" htmlFor={`feedback-${s.id}`}>
                      Feedback
                    </label>
                    <input
                      id={`feedback-${s.id}`}
                      name="feedback"
                      defaultValue={s.feedback ?? ""}
                      placeholder="What was good, what to improve."
                      className="input"
                    />
                  </div>
                  <SubmitButton label={isGraded ? "Update mark" : "Save mark"} />
                </form>

                {isGraded && (
                  <form action={unmarkSubmission} className="mt-2">
                    <input type="hidden" name="id" value={s.id} />
                    <button
                      type="submit"
                      className="text-xs font-semibold text-slate-500 underline hover:text-navy"
                      title="Lets the member replace their file again"
                    >
                      Unmark
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
