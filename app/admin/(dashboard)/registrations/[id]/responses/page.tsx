import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RegistrationResponseCard from "@/components/admin/RegistrationResponseCard";
import {
  parseQuestions,
  parseAnswers,
  answerText,
  flattenQuestions,
} from "@/lib/forms";
import { formatDateTime } from "@/lib/utils";
import { deleteResponse } from "../../actions";
import { can, requireView } from "@/lib/adminAccess";

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

  const questions = flattenQuestions(parseQuestions(form.questions));
  const canDelete = await can("registrations", "delete");

  return (
    <div>
      <Link
        href="/admin/registrations"
        className="text-sm text-accent-dark hover:text-accent"
      >
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
          ↓ Download Excel
        </a>
      </div>

      <p className="mt-4 rounded-xl bg-blue-50 p-3 text-xs text-slate-600">
        Download a formatted Excel workbook with one row per response and one
        column per question. The header is frozen and every column is filterable.
      </p>

      {form.responses.length === 0 ? (
        <p className="mt-8 text-slate-500">No responses yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {form.responses.map((response, index) => {
            const answers = parseAnswers(response.answers);
            const nameQuestion = questions.find((question) =>
              /^(full\s*name|name|nama(?:\s+lengkap)?)$/i.test(
                question.label.trim(),
              ),
            );
            const emailQuestion = questions.find(
              (question) => question.type === "EMAIL",
            );
            const answerName = nameQuestion
              ? answerText(answers[nameQuestion.id])
              : "";
            const answerEmail = emailQuestion
              ? answerText(answers[emailQuestion.id])
              : "";
            const displayName =
              response.user?.name ||
              response.guestName ||
              answerName ||
              `Response ${index + 1}`;
            const displayEmail =
              response.user?.email || response.guestEmail || answerEmail;

            return (
              <RegistrationResponseCard
                key={response.id}
                responseId={response.id}
                name={displayName}
                email={displayEmail}
                account={response.user ? "Member" : "Public"}
                submittedAt={formatDateTime(response.createdAt)}
                questions={questions}
                answers={answers}
                deleteAction={deleteResponse}
                canDelete={canDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
