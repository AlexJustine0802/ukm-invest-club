"use client";

import { useActionState, useRef, useState } from "react";
import Spinner from "@/components/Spinner";
import { useFormStatus } from "react-dom";
import { AlertCircle, Paperclip } from "lucide-react";
import {
  submitRegistration,
  type SubmitState,
} from "@/app/(site)/register/[slug]/actions";
import { DEFAULT_MAX_MB, sectionsOf, type FormQuestion } from "@/lib/forms";

const fieldClass =
  "w-full rounded-xl border border-slate-200 p-3 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-primary";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
    >
      {pending && <Spinner />}
      {pending ? "Submitting…" : "Submit"}
    </button>
  );
}

/**
 * One question, plus whatever its answer unlocks.
 *
 * `live` is false for a section that is not on screen. Those stay mounted so
 * their answers are still submitted, but nothing in them is `required` — the
 * browser refuses to submit a form with a required field it cannot show.
 */
function Question({
  question: q,
  live,
}: {
  question: FormQuestion;
  live: boolean;
}) {
  const key = `q_${q.id}`;
  const required = q.required && live;
  const [value, setValue] = useState("");
  const branch = q.branches?.[value];

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <label htmlFor={key} className="font-semibold text-navy">
          {q.label}
          {q.required && <span className="ml-1 text-rose-500">*</span>}
        </label>
        {q.helpText && (
          <p className="mt-0.5 text-sm text-slate-500">{q.helpText}</p>
        )}

        <div className="mt-3">
          {q.type === "SHORT_TEXT" && (
            <input id={key} name={key} required={required} className={fieldClass} />
          )}

          {q.type === "LONG_TEXT" && (
            <textarea
              id={key}
              name={key}
              rows={5}
              required={required}
              className={`resize-y ${fieldClass}`}
            />
          )}

          {q.type === "DATE" && (
            <input
              id={key}
              name={key}
              type="date"
              required={required}
              className={fieldClass}
            />
          )}

          {q.type === "DROPDOWN" && (
            <select
              id={key}
              name={key}
              required={required}
              value={value}
              onChange={(e) => setValue(e.target.value)}
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
                <label
                  key={o}
                  className="flex items-center gap-3 text-sm text-slate-600"
                >
                  <input
                    type="radio"
                    name={key}
                    value={o}
                    required={required}
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
                <label
                  key={o}
                  className="flex items-center gap-3 text-sm text-slate-600"
                >
                  <input
                    type="checkbox"
                    name={key}
                    value={o}
                    className="h-4 w-4"
                  />
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
                required={required}
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

      {/* Follow-ups for the answer just picked. Unmounted when the answer
          changes, so a branch nobody is on submits nothing. */}
      {branch?.map((child) => (
        <div key={child.id} className="ml-4 border-l-2 border-blue-100 pl-4">
          <Question question={child} live={live} />
        </div>
      ))}
    </>
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

  const sections = sectionsOf(questions);
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const last = step === sections.length - 1;

  // Next only moves on if this section is filled in. Only the visible section
  // carries `required`, so the browser's own check is the whole validation.
  const next = () => {
    if (!formRef.current?.reportValidity()) return;
    setStep((s) => Math.min(s + 1, sections.length - 1));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <input type="hidden" name="formId" value={formId} />

      {sections.length > 1 && (
        <p className="text-sm font-semibold text-slate-500">
          Section {step + 1} of {sections.length}
        </p>
      )}

      {askGuestDetails && (
        <div className={step === 0 ? undefined : "hidden"}>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="font-semibold text-navy">Your details</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="guestName"
                  className="text-sm font-medium text-slate-600"
                >
                  Full name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="guestName"
                  name="guestName"
                  required={step === 0}
                  className={`mt-1 ${fieldClass}`}
                />
              </div>
              <div>
                <label
                  htmlFor="guestEmail"
                  className="text-sm font-medium text-slate-600"
                >
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  id="guestEmail"
                  name="guestEmail"
                  type="email"
                  required={step === 0}
                  className={`mt-1 ${fieldClass}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Every section stays mounted: leaving one must not throw away what was
          typed into it, and the whole form posts in one submit. */}
      {sections.map((section, i) => (
        <div key={i} className={i === step ? "space-y-4" : "hidden"}>
          {section.map((q) => (
            <Question key={q.id} question={q} live={i === step} />
          ))}
        </div>
      ))}

      {state.error && (
        <p className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={back}
            className="rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Back
          </button>
        )}

        {last ? (
          <Submit />
        ) : (
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Next section
          </button>
        )}

        <p className="text-xs text-slate-400">
          Your answers are sent to the Invest Club admin team.
        </p>
      </div>
    </form>
  );
}
