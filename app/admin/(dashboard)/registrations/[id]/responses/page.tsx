import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import {
  parseQuestions,
  parseAnswers,
  answerText,
  flattenQuestions,
} from "@/lib/forms";
import { formatDateTime } from "@/lib/utils";
import { deleteResponse } from "../../actions";
import Can from "@/components/admin/Can";
import { requireView } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function ResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireView("registrations");

  const { id } = await params;

  const form = await prisma.registrationForm.findUnique({
    where: { id },
    include: {
      responses: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      },
    },
  });
  if (!form) notFound();

  // Branch answers are answers too, so the table gets a column for each.
  const questions = flattenQuestions(parseQuestions(form.questions));

  return (
    <div>
      <Link href="/admin/registrations" className="text-sm text-accent-dark hover:text-accent">
        ← Back to registrations
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{form.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {form.responses.length} response
            {form.responses.length === 1 ? "" : "s"} · newest first
          </p>
        </div>
        <a
          href={`/admin/registrations/${form.id}/responses/export`}
          className="btn-primary"
        >
          ⬇ Download CSV
        </a>
      </div>

      <p className="mt-4 rounded-xl bg-blue-50 p-3 text-xs text-slate-600">
        The CSV opens straight in Google Sheets (File → Import) or Excel. One row
        per response, one column per question  re-download after new responses
        come in.
      </p>

      {form.responses.length === 0 ? (
        <p className="mt-8 text-slate-500">No responses yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {form.responses.map((r, index) => {
            const answers = parseAnswers(r.answers);
            const nameQuestion = questions.find((q) =>
              /^(full\s*name|name|nama(?:\s+lengkap)?)$/i.test(q.label.trim()),
            );
            const emailQuestion = questions.find((q) => q.type === "EMAIL");
            const answerName = nameQuestion
              ? answerText(answers[nameQuestion.id])
              : "";
            const answerEmail = emailQuestion
              ? answerText(answers[emailQuestion.id])
              : "";
            const displayName =
              r.user?.name || r.guestName || answerName || `Response ${index + 1}`;
            const displayEmail = r.user?.email || r.guestEmail || answerEmail;

            return (
              <article
                key={r.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-primary">
                        {(displayName || "?").charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate font-bold text-navy">
                          {displayName || `Response ${index + 1}`}
                        </h2>
                        <p className="mt-0.5 truncate text-sm text-slate-500">
                          {displayEmail || "No email provided"}
                        </p>
                      </div>
                    </div>
                    {!r.user && (
                      <span className="shrink-0 rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                        Guest
                      </span>
                    )}
                  </div>

                  <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold uppercase tracking-wide text-slate-400">
                        Submitted
                      </dt>
                      <dd className="mt-1 text-slate-600">
                        {formatDateTime(r.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-semibold uppercase tracking-wide text-slate-400">
                        Account
                      </dt>
                      <dd className="mt-1 text-slate-600">
                        {r.user ? "Member" : "Public"}
                      </dd>
                    </div>
                  </dl>
                </div>

                <dl className="divide-y divide-slate-100">
                  {questions.map((q) => {
                    const value = answers[q.id];
                    return (
                      <div key={q.id} className="px-5 py-4">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {q.label}
                        </dt>
                        <dd className="mt-1.5 break-words text-sm text-slate-700">
                          {q.type === "FILE" && value ? (
                            <a
                              href={String(value)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-primary hover:underline"
                            >
                              Download file
                            </a>
                          ) : (
                            <span className="line-clamp-5 whitespace-pre-wrap">
                              {answerText(value) || "—"}
                            </span>
                          )}
                        </dd>
                      </div>
                    );
                  })}
                </dl>

                <div className="flex justify-end border-t border-slate-100 px-5 py-3">
                  <Can module="registrations" action="delete">
                    <DeleteButton
                      action={deleteResponse}
                      id={r.id}
                      label="Delete response"
                      className="btn-danger px-3 py-1.5 text-xs"
                      confirmMessage="Delete this response? This cannot be undone."
                    />
                  </Can>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
