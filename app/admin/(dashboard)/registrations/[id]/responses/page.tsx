import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { parseQuestions, parseAnswers, answerText } from "@/lib/forms";
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

  const questions = parseQuestions(form.questions);

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
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-max text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Submitted</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                {questions.map((q) => (
                  <th key={q.id} className="px-4 py-3 font-semibold">
                    {q.label}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {form.responses.map((r) => {
                const answers = parseAnswers(r.answers);
                return (
                  <tr key={r.id} className="border-t border-slate-100 align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {formatDateTime(r.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium text-navy">
                      {r.user?.name ?? r.guestName ?? ""}
                      {!r.user && (
                        <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                          Guest
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {r.user?.email ?? r.guestEmail ?? ""}
                    </td>
                    {questions.map((q) => {
                      const value = answers[q.id];
                      return (
                        <td key={q.id} className="max-w-xs px-4 py-3 text-slate-600">
                          {q.type === "FILE" && value ? (
                            <a
                              href={String(value)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-primary hover:underline"
                            >
                              Download
                            </a>
                          ) : (
                            <span className="line-clamp-4 whitespace-pre-wrap">
                              {answerText(value) || ""}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3">
                      <Can module="registrations" action="delete">
                        <DeleteButton
                          action={deleteResponse}
                          id={r.id}
                          label="Delete"
                          className="btn-danger px-3 py-1.5 text-xs"
                          confirmMessage="Delete this response? This cannot be undone."
                        />
                      </Can>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
