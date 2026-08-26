"use client";

import { useEffect, useState } from "react";
import { Clock3, FileText, Mail, UserRound, X } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";
import { answerText, type FormAnswers, type FormQuestion } from "@/lib/forms";

type ResponseQuestion = Pick<FormQuestion, "id" | "label" | "type">;

export default function RegistrationResponseCard({
  responseId,
  name,
  email,
  account,
  submittedAt,
  questions,
  answers,
  deleteAction,
  canDelete,
}: {
  responseId: string;
  name: string;
  email: string;
  account: "Member" | "Public";
  submittedAt: string;
  questions: ResponseQuestion[];
  answers: FormAnswers;
  deleteAction: (formData: FormData) => Promise<void>;
  canDelete: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const initial = (name || "?").charAt(0).toUpperCase();

  const dialog = (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-navy-dark/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={`response-title-${responseId}`}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-primary">
              {initial}
            </span>
            <div className="min-w-0">
              <h2
                id={`response-title-${responseId}`}
                className="truncate text-lg font-bold text-navy"
              >
                {name}
              </h2>
              <p className="truncate text-sm text-slate-500">
                {email || "No email provided"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close response details"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <dl className="grid gap-4 border-b border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Submitted
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{submittedAt}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <UserRound className="mt-0.5 h-4 w-4 text-primary" />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account
              </dt>
              <dd className="mt-1 text-sm text-slate-700">{account}</dd>
            </div>
          </div>
        </dl>

        <dl className="divide-y divide-slate-100">
          {questions.map((question) => {
            const value = answers[question.id];
            return (
              <div key={question.id} className="px-5 py-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {question.label}
                </dt>
                <dd className="mt-1.5 break-words text-sm text-slate-700">
                  {question.type === "FILE" && value ? (
                    <a
                      href={String(value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 font-semibold text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4" />
                      Download file
                    </a>
                  ) : (
                    <span className="whitespace-pre-wrap">
                      {answerText(value) || "—"}
                    </span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>

        {canDelete && (
          <div className="flex justify-end border-t border-slate-100 px-5 py-4">
            <DeleteButton
              action={deleteAction}
              id={responseId}
              label="Delete response"
              className="btn-danger px-3 py-1.5 text-xs"
              confirmMessage="Delete this response? This cannot be undone."
            />
          </div>
        )}
      </section>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-primary">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-bold text-navy">{name}</h2>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {account}
              </span>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              {email || "No email provided"}
            </p>
          </div>
          <span className="hidden shrink-0 text-xs font-semibold text-primary sm:block">
            View details
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
          <Clock3 className="h-3.5 w-3.5" />
          {submittedAt}
        </div>
      </button>

      {open && dialog}
    </>
  );
}
