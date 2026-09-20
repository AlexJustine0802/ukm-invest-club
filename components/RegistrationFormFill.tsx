"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { upload } from "@vercel/blob/client";
import Spinner from "@/components/Spinner";
import { AlertCircle, Paperclip } from "lucide-react";
import {
  submitRegistration,
  type SubmitState,
} from "@/app/(site)/register/[slug]/actions";
import { MAX_MB_LIMIT, sectionsOf, type FormQuestion } from "@/lib/forms";
import { MAX_UPLOAD_BYTES } from "@/lib/uploadLimits";
import { safeUploadName } from "@/lib/uploadPath";

const fieldClass =
  "w-full rounded-xl border border-slate-200 p-3 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-primary";
const DRAFT_PREFIX = "registration-draft:v1:";
type DraftValue = string | string[];
type Draft = Record<string, DraftValue>;

function Submit({ pending }: { pending: boolean }) {
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
 * their answers are still submitted, but nothing in them is `required`  the
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
  onFileChange,
}: {
  question: FormQuestion;
  live: boolean;
  value: string;
  onValue: (next: string) => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
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

          {q.type === "EMAIL" && (
            <input
              id={key}
              name={key}
              type="email"
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
                onChange={onFileChange}
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy hover:file:bg-slate-200"
              />
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
                <Paperclip className="h-3 w-3" />
                Max {MAX_MB_LIMIT} MB.
              </p>
            </>
          )}
        </div>
      </div>
  );
}

interface FlowItem {
  question: FormQuestion;
  /** How deep in a branch it is  drives the indent, nothing else. */
  depth: number;
}

/**
 * Flatten the questions into the sequence being asked right now.
 *
 * Only the branch matching the answer given is included, so changing a
 * dropdown rewrites everything after it  including where the sections fall.
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
  basePath,
}: {
  formId: string;
  questions: FormQuestion[];
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, startSubmitting] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const draftRef = useRef<Draft | null>(null);
  const submittingRef = useRef(false);
  const draftKey = `${DRAFT_PREFIX}${formId}`;

  const saveDraft = useCallback(() => {
    const form = formRef.current;
    if (!form) return;

    const draft: Draft = {};
    for (const element of Array.from(form.elements)) {
      const name = element.getAttribute("name");
      if (!name?.startsWith("q_")) continue;

      const control = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (
        (control instanceof HTMLInputElement &&
          (control.type === "file" ||
            ((control.type === "radio" || control.type === "checkbox") &&
              !control.checked)))
      ) {
        continue;
      }

      const value = control.value;
      const previous = draft[name];
      draft[name] = previous
        ? [...(Array.isArray(previous) ? previous : [previous]), value]
        : value;
    }
    draftRef.current = draft;
    try {
      const serialized = JSON.stringify(draft);
      window.localStorage.setItem(draftKey, serialized);
      window.sessionStorage.setItem(draftKey, serialized);
    } catch {
      try {
        window.sessionStorage.setItem(draftKey, JSON.stringify(draft));
      } catch {
        // Private browsing or strict browser policies must not break the form.
      }
    }
  }, [draftKey]);

  const restoreDraftFields = useCallback(() => {
    const form = formRef.current;
    if (!form || !draftRef.current) return;
    for (const [name, saved] of Object.entries(draftRef.current)) {
      const wanted = Array.isArray(saved) ? saved : [saved];
      const controls = Array.from(form.elements).filter(
        (element) => element.getAttribute("name") === name,
      ) as HTMLInputElement[];
      for (const control of controls) {
        if (control.type === "radio" || control.type === "checkbox") {
          control.checked = wanted.includes(control.value);
        } else {
          control.value = wanted[0] ?? "";
        }
      }
    }
    setDraftRestored(true);
  }, []);

  // Restore dropdowns first so their conditional questions can be rendered.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw =
          window.localStorage.getItem(draftKey) ??
          window.sessionStorage.getItem(draftKey);
        if (!raw) return;
        const saved = JSON.parse(raw) as Draft;
        if (!saved || typeof saved !== "object") return;
        draftRef.current = saved;
        const dropdownValues: Record<string, string> = {};
        for (const [name, value] of Object.entries(saved)) {
          if (typeof value === "string") dropdownValues[name.slice(2)] = value;
        }
        setValues((current) => ({ ...current, ...dropdownValues }));
      } catch {
        try {
          window.localStorage.removeItem(draftKey);
          window.sessionStorage.removeItem(draftKey);
        } catch {
          // Ignore storage cleanup failures.
        }
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [draftKey]);

  // Fill native inputs after conditional branches have appeared in the DOM.
  useEffect(() => {
    if (!draftRef.current) return;
    const timer = window.setTimeout(restoreDraftFields, 0);
    return () => window.clearTimeout(timer);
  }, [restoreDraftFields, values]);

  // React resets uncontrolled fields after a form action finishes. Restore
  // the latest draft when the server returns a validation/database error.
  useEffect(() => {
    if (!state.error) return;
    submittingRef.current = false;
    const timer = window.setTimeout(restoreDraftFields, 0);
    return () => window.clearTimeout(timer);
  }, [restoreDraftFields, state.error]);

  useEffect(() => {
    const saveBeforeLeaving = () => saveDraft();
    window.addEventListener("beforeunload", saveBeforeLeaving);
    return () => window.removeEventListener("beforeunload", saveBeforeLeaving);
  }, [saveDraft]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    saveDraft();
    const file = event.target.files?.[0];
    if (file && file.size > MAX_UPLOAD_BYTES) {
      event.target.value = "";
      setUploadError(
        `File is too large. Please choose a file up to ${MAX_MB_LIMIT} MB. Your answers were saved.`,
      );
      return;
    }
    setUploadError(null);
  };

  const submit = async (formData: FormData) => {
    saveDraft();
    setUploadError(null);
    setIsUploading(true);
    try {
      const fileQuestions: FormQuestion[] = [];
      const collectFiles = (list: FormQuestion[]) => {
        for (const question of list) {
          if (question.type === "FILE") fileQuestions.push(question);
          for (const branch of Object.values(question.branches ?? {})) collectFiles(branch);
        }
      };
      collectFiles(questions);
      for (const question of fileQuestions) {
        const key = `q_${question.id}`;
        const file = formData.get(key);
        if (!(file instanceof File) || file.size === 0) continue;
        const blob = await upload(`form-uploads/${safeUploadName(file.name)}`, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          clientPayload: JSON.stringify({ formId }),
          multipart: true,
        });
        formData.delete(key);
        formData.set(`${key}_url`, blob.url);
        formData.set(`${key}_name`, file.name);
        const input = document.getElementById(key) as HTMLInputElement | null;
        if (input) input.value = "";
      }
      startSubmitting(() => action(formData));
    } catch (error) {
      submittingRef.current = false;
      const message = error instanceof Error ? error.message : "";
      setUploadError(
        /token|configured|unauthorized|503/i.test(message)
          ? "File upload is not configured yet. Your answers were saved, please contact admin."
          : "The file could not be uploaded. Your answers were saved; please try again.",
      );
      window.setTimeout(restoreDraftFields, 0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    void submit(new FormData(event.currentTarget));
  };

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
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onInput={saveDraft}
      onChange={saveDraft}
      className="space-y-4"
    >
      <input type="hidden" name="formId" value={formId} />
      <input type="hidden" name="basePath" value={basePath} />

      {draftRestored && (
        <p className="rounded-xl bg-blue-50 p-3 text-sm font-medium text-blue-700">
          Your saved answers were restored.
        </p>
      )}

      {sections.length > 1 && (
        <p className="text-sm font-semibold text-slate-500">
          Section {stepIndex + 1} of {sections.length}
        </p>
      )}

      {/* Every section stays mounted: leaving one must not throw away what was
          typed into it, and the whole form posts in one submit. Changing a
          dropdown does drop the sections after it, which is the point  those
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
                onFileChange={handleFileChange}
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
      {uploadError && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="upload-error-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div>
                <h2 id="upload-error-title" className="font-semibold text-navy">
                  Upload notice
                </h2>
                <p className="mt-1 text-sm text-slate-600">{uploadError}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              OK
            </button>
          </div>
        </div>
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
          <Submit pending={isUploading || isSubmitting} />
        ) : (
          <button
            type="button"
            onClick={next}
            className="rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Next section
          </button>
        )}

      </div>
    </form>
  );
}
