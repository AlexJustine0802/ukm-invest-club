"use client";

import { useState } from "react";
import FormQuestionsEditor from "@/components/admin/FormQuestionsEditor";
import type { FormQuestion } from "@/lib/forms";

/**
 * How people apply for a posting: the company's own link, or one of our
 * registration forms.
 *
 * One or the other, never both — a posting with two Apply buttons is a posting
 * where half the applicants land somewhere the club cannot see. The radio is
 * what decides; the unused field is not rendered, so it cannot be saved by
 * accident.
 */
export default function ApplyMethodFields({
  defaultUrl,
  defaultFormId,
  questions,
  formSlug,
}: {
  defaultUrl: string | null;
  defaultFormId: string | null;
  /** Questions of the form this posting already owns, if any. */
  questions: FormQuestion[];
  /** Its public link, shown so it can be shared. */
  formSlug: string | null;
}) {
  const [method, setMethod] = useState<"link" | "form">(
    defaultFormId ? "form" : "link",
  );

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 p-4">
      <div>
        <p className="font-bold text-navy">Apply Metode</p>
      </div>

      <input type="hidden" name="applyMethod" value={method} />

      <label className="flex items-start gap-3">
        <input
          type="radio"
          checked={method === "link"}
          onChange={() => setMethod("link")}
          className="mt-1 h-4 w-4"
        />
        <span className="text-sm font-medium text-navy">
          Link to the company&apos;s own application
        </span>
      </label>

      {method === "link" && (
        <div className="pl-7">
          <label htmlFor="applyUrl" className="label">
            Apply link
          </label>
          <input
            id="applyUrl"
            name="applyUrl"
            type="url"
            defaultValue={defaultUrl ?? ""}
            placeholder="https://..."
            className="input"
          />
        </div>
      )}

      <label className="flex items-start gap-3">
        <input
          type="radio"
          checked={method === "form"}
          onChange={() => setMethod("form")}
          className="mt-1 h-4 w-4"
        />
        <span className="text-sm font-medium text-navy">
          Application form on this site
        </span>
      </label>

      {method === "form" && (
        <div className="space-y-3 pl-7">
          <label className="label">Application questions</label>
          <FormQuestionsEditor name="applyQuestions" initial={questions} />
          {defaultFormId && formSlug && (
            <p className="text-xs text-slate-500">
              Responses live under Registrations. Direct link:{" "}
              <code>/register/{formSlug}</code>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
