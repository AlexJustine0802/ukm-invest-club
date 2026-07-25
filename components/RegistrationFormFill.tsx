"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Paperclip } from "lucide-react";
import {
  submitRegistration,
  type SubmitState,
} from "@/app/(site)/register/[slug]/actions";
import { DEFAULT_MAX_MB, type FormQuestion } from "@/lib/forms";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
    >
      {pending ? "Submitting…" : "Submit"}
    </button>
  );
}

export default function RegistrationFormFill({
  formId,
  questions,
  askGuestDetails,
}: {
  formId: string;
  questions: FormQuestion[];
  /** True when nobody is signed in — we need a name and email on the row. */
  askGuestDetails: boolean;
}) {
  const [state, action] = useActionState<SubmitState, FormData>(
    submitRegistration,
    {},
  );

  const fieldClass =
    "w-full rounded-xl border border-slate-200 p-3 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-primary";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="formId" value={formId} />

      {askGuestDetails && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="font-semibold text-navy">Your details</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="guestName" className="text-sm font-medium text-slate-600">
                Full name <span className="text-rose-500">*</span>
              </label>
              <input
                id="guestName"
                name="guestName"
                required
                className={`mt-1 ${fieldClass}`}
              />
            </div>
            <div>
              <label htmlFor="guestEmail" className="text-sm font-medium text-slate-600">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                id="guestEmail"
                name="guestEmail"
                type="email"
                required
                className={`mt-1 ${fieldClass}`}
              />
            </div>
          </div>
        </div>
      )}

      {questions.map((q) => {
        const key = `q_${q.id}`;
        return (
          <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-5">
            <label htmlFor={key} className="font-semibold text-navy">
              {q.label}
              {q.required && <span className="ml-1 text-rose-500">*</span>}
            </label>
            {q.helpText && (
              <p className="mt-0.5 text-sm text-slate-500">{q.helpText}</p>
            )}

            <div className="mt-3">
              {q.type === "SHORT_TEXT" && (
                <input id={key} name={key} required={q.required} className={fieldClass} />
              )}

              {q.type === "LONG_TEXT" && (
                <textarea
                  id={key}
                  name={key}
                  rows={5}
                  required={q.required}
                  className={`resize-y ${fieldClass}`}
                />
              )}

              {q.type === "DATE" && (
                <input
                  id={key}
                  name={key}
                  type="date"
                  required={q.required}
                  className={fieldClass}
                />
              )}

              {q.type === "DROPDOWN" && (
                <select
                  id={key}
                  name={key}
                  required={q.required}
                  defaultValue=""
                  className={fieldClass}
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  {(q.options ?? []).map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              )}

              {q.type === "CHOICE" && (
                <div className="space-y-2">
                  {(q.options ?? []).map((o) => (
                    <label key={o} className="flex items-center gap-3 text-sm text-slate-600">
                      <input
                        type="radio"
                        name={key}
                        value={o}
                        required={q.required}
                        className="h-4 w-4"
                      />
                      {o}
                    </label>
                  ))}
                </div>
              )}

              {q.type === "CHECKBOX" && (
                <div className="space-y-2">
                  {(q.options ?? []).map((o) => (
                    <label key={o} className="flex items-center gap-3 text-sm text-slate-600">
                      <input type="checkbox" name={key} value={o} className="h-4 w-4" />
                      {o}
                    </label>
                  ))}
                </div>
              )}

              {q.type === "FILE" && (
                <>
                  <input
                    id={key}
                    name={key}
                    type="file"
                    required={q.required}
                    className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy hover:file:bg-slate-200"
                  />
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                    <Paperclip className="h-3 w-3" />
                    Max {q.maxMb ?? DEFAULT_MAX_MB} MB.
                  </p>
                </>
              )}
            </div>
          </div>
        );
      })}

      {state.error && (
        <p className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Submit />
        <p className="text-xs text-slate-400">
          Your answers are sent to the Invest Club admin team.
        </p>
      </div>
    </form>
  );
}
