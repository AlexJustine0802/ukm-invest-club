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
 * One question.
 *
 * `live` is false for a section that is not on screen. Those stay mounted so
 * their answers are still submitted, but nothing in them is `required` — the
 * browser refuses to submit a form with a required field it cannot show.
 *
 * Dropdown answers are held by the form above, because they decide which
 * questions come next and therefore where the sections fall.
 */
function Question({
  question: q,
  live,
  value,
  onValue,
}: {
  question: FormQuestion;
  live: boolean;
  value: string;
  onValue: (next: string) => void;
}) {
  const key = `q_${q.id}`;
  const required = q.required && live;

  return (
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
              onChange={(e) => onValue(e.target.value)}
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
  );
}

interface FlowItem {
  question: FormQuestion;
  /** How deep in a branch it is — drives the indent, nothing else. */
  depth: number;
}

/**
 * Flatten the questions into the sequence being asked right now.
 *
 * Only the branch matching the answer given is included, so changing a
 * dropdown rewrites everything after it — including where the sections fall.
 */
function expand(
  list: FormQuestion[],
  values: Record<string, string>,
  depth: number,
): FlowItem[] {
  const out: FlowItem[] = [];
  for (const question of list) {
    out.push({ question, depth });
    const branch = question.branches?.[values[question.id] ?? ""];
    if (branch) out.push(...expand(branch, values, depth + 1));
  }
  return out;
}

export default function RegistrationFormFill({
  formId,
  questions,
  askGuestDetails,
  basePath,
}: {
  formId: string;
  questions: FormQuestion[];
  /** True when nobody is signed in — we need a name and email on the row. */
  askGuestDetails: boolean;
  /** Which area is showing the form; the submit returns to the same one. */
  basePath: "/register" | "/account/register";
}) {
  const [state, action] = useActionState<SubmitState, FormData>(
    submitRegistration,
    {},
  );

  // Dropdown answers live here because they decide which questions come next,
  // and therefore where the section breaks fall.
  const [values, setValues] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  // The questions actually being asked, in order: a branch's follow-ups are
  // spliced in right after the dropdown that opened them. A section break
  // inside a branch is therefore a break in this flow like any other, which is
  // what lets a branch carry its own sections.
  const flow = expand(questions, values, 0);
  const sections = sectionsOf(flow.map((f) => f.question)).map((section) =>
    section.map((q) => flow.find((f) => f.question.id === q.id)!),
  );
  const stepIndex = Math.min(step, sections.length - 1);
  const last = stepIndex === sections.length - 1;

  // Next only moves on if this section is filled in. Only the visible section
  // carries `required`, so the browser's own check is the whole validation.
  const goTo = (index: number) => {
    setStep(Math.max(0, Math.min(index, sections.length - 1)));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const next = () => {
    if (!formRef.current?.reportValidity()) return;
    goTo(stepIndex + 1);
  };

  const back = () => goTo(stepIndex - 1);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <input type="hidden" name="formId" value={formId} />
      <input type="hidden" name="basePath" value={basePath} />

      {sections.length > 1 && (
        <p className="text-sm font-semibold text-slate-500">
          Section {stepIndex + 1} of {sections.length}
        </p>
      )}

      {askGuestDetails && (
        <div className={stepIndex === 0 ? undefined : "hidden"}>
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
                  required={stepIndex === 0}
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
                  required={stepIndex === 0}
                  className={`mt-1 ${fieldClass}`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Every section stays mounted: leaving one must not throw away what was
          typed into it, and the whole form posts in one submit. Changing a
          dropdown does drop the sections after it, which is the point — those
          questions belong to a branch nobody is on any more. */}
      {sections.map((section, i) => (
        <div key={i} className={i === stepIndex ? "space-y-4" : "hidden"}>
          {section.map(({ question, depth }) => (
            <div
              key={question.id}
              className={
                depth > 0 ? "ml-4 border-l-2 border-blue-100 pl-4" : undefined
              }
            >
              <Question
                question={question}
                live={i === stepIndex}
                value={values[question.id] ?? ""}
                onValue={(answer) => {
                  setValues((current) => ({
                    ...current,
                    [question.id]: answer,
                  }));
                  // A new answer can lengthen or shorten the form. Pin the
                  // reader where they are instead of letting a clamped step
                  // spring forward when the flow grows again.
                  setStep(stepIndex);
                }}
              />
            </div>
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
        {stepIndex > 0 && (
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
