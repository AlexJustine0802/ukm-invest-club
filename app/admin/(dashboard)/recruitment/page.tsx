import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  formStatus,
  parseQuestions,
  flattenQuestions,
  parseAnswers,
  answerText,
} from "@/lib/forms";
import { formatDateTime } from "@/lib/utils";
import Can from "@/components/admin/Can";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteRegistrationForm } from "../registrations/actions";
import { requireView } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-emerald-50 text-emerald-700" },
  closed: { label: "Closed", className: "bg-slate-100 text-slate-400" },
  "not-yet": { label: "Opens soon", className: "bg-amber-50 text-amber-700" },
  hidden: { label: "Hidden", className: "bg-slate-100 text-slate-400" },
};

export default async function AdminRecruitmentPage() {
  await requireView("recruitment");

  const forms = await prisma.registrationForm.findMany({
    where: { isRecruitment: true },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { responses: true } } },
  });

  const now = new Date();
  const current = forms[0] ?? null;
  const past = forms.slice(1);

  // Applicants of the current round, for the quick preview below.
  const applicants = current
    ? await prisma.formResponse.findMany({
        where: { formId: current.id },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: { select: { name: true, email: true } } },
      })
    : [];

  const questions = current
    ? flattenQuestions(parseQuestions(current.questions))
    : [];
  const status = current ? formStatus(current, now) : "hidden";
  const badge = STATUS_BADGE[status];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Recruitment</h1>
        </div>
        <Can module="registrations" action="create">
          <Link href="/admin/registrations/new" className="btn-primary">
            + New recruitment form
          </Link>
        </Can>
      </div>

      {!current ? (
        <div className="card mt-8 p-8 text-center">
          <p className="font-semibold text-navy">No recruitment round yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Create a registration form, write its questions, then tick{" "}
            <strong>“This is the club recruitment”</strong> and set the open and
            close dates. A future open date is announced to members straight
            away, even while the form itself is still unpublished.
          </p>
          <Can module="registrations" action="create">
            <Link
              href="/admin/registrations/new"
              className="btn-primary mt-5 inline-block"
            >
              Create the form
            </Link>
          </Can>
        </div>
      ) : (
        <>
          {/* Current round */}
          <div className="card mt-6 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-navy">
                    {current.title}
                  </h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
                {current.description && (
                  <p className="mt-1 max-w-2xl text-sm text-slate-500">
                    {current.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  {questions.length === 1 ? "" : "s"} ·{" "}
                  {current.opensAt
                    ? `opens ${formatDateTime(current.opensAt)}`
                    : "opens immediately"}{" "}
                  ·{" "}
                  {current.closesAt
                    ? `closes ${formatDateTime(current.closesAt)}`
                    : "no close date"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/admin/registrations/${current.id}/responses`}
                  className="btn-primary px-3 py-1.5 text-xs"
                >
                  Applicants ({current._count.responses})
                </Link>
                <a
                  href={`/admin/registrations/${current.id}/responses/export`}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  ⬇ Export Excel
                </a>
                <Can module="registrations" action="edit">
                  <Link
                    href={`/admin/registrations/${current.id}/edit`}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    Edit form
                  </Link>
                </Can>
                <Link
                  href={`/register/${current.slug}`}
                  target="_blank"
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Open link
                </Link>
                <Can module="registrations" action="delete">
                  <DeleteButton
                    action={deleteRegistrationForm}
                    id={current.id}
                    className="btn-danger px-3 py-1.5 text-xs"
                    confirmMessage="Delete this recruitment round? Its applicants and answers go with it. This cannot be undone."
                  />
                </Can>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Applicants", value: current._count.responses },
                {
                  label: "Capacity",
                  value:
                    current.capacity === null ? "Unlimited" : current.capacity,
                },
                { label: "Questions", value: questions.length },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {s.label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-navy">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Latest applicants */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy">Latest applicants</h2>
              {current._count.responses > applicants.length && (
                <Link
                  href={`/admin/registrations/${current.id}/responses`}
                  className="text-sm font-semibold text-accent-dark hover:text-accent"
                >
                  See all {current._count.responses} →
                </Link>
              )}
            </div>

            {applicants.length === 0 ? (
              <p className="mt-4 text-slate-500">Nobody has applied yet.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {applicants.map((a) => {
                  const answers = parseAnswers(a.answers);
                  const name = a.user?.name ?? a.guestName ?? "";
                  const preview = questions
                    .slice(0, 2)
                    .map(
                      (q) => `${q.label}: ${answerText(answers[q.id]) || ""}`,
                    )
                    .join(" · ");
                  return (
                    <div
                      key={a.id}
                      className="card flex flex-wrap items-center gap-4 p-4"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-primary">
                        {name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-navy">
                          {name}
                          {!a.user && (
                            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                              Guest
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">
                          {a.user?.email ?? a.guestEmail ?? ""} ·{" "}
                          {formatDateTime(a.createdAt)}
                        </p>
                        {preview && (
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {preview}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Past rounds */}
          {past.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-bold text-navy">Past rounds</h2>
              <div className="mt-4 space-y-3">
                {past.map((f) => (
                  <div
                    key={f.id}
                    className="card flex flex-wrap items-center gap-4 p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-navy">{f.title}</p>
                      <p className="text-xs text-slate-400">
                        {f._count.responses} applicant
                        {f._count.responses === 1 ? "" : "s"} · created{" "}
                        {formatDateTime(f.createdAt)}
                      </p>
                    </div>
                    <Link
                      href={`/admin/registrations/${f.id}/responses`}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Applicants
                    </Link>
                    <Can module="registrations" action="delete">
                      <DeleteButton
                        action={deleteRegistrationForm}
                        id={f.id}
                        className="btn-danger px-3 py-1.5 text-xs"
                        confirmMessage="Delete this recruitment round? Its applicants and answers go with it. This cannot be undone."
                      />
                    </Can>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
