"use client";

import { useActionState } from "react";
import Spinner from "@/components/Spinner";
import { useFormStatus } from "react-dom";
import {
  AlertCircle,
  CheckCircle2,
  Paperclip,
  UploadCloud,
} from "lucide-react";
import { submitAssignment } from "@/app/account/assignments/[id]/actions";
import {
  MAX_SUBMISSION_MB,
  SUBMISSION_ACCEPT,
  type SubmitState,
} from "@/lib/submissions";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
    >
      {pending ? (
        <Spinner className="mr-0" />
      ) : (
        <UploadCloud className="h-4 w-4" />
      )}
      {pending ? "Uploading…" : label}
    </button>
  );
}

export default function SubmitAssignmentForm({
  assignmentId,
  hasSubmission,
  note,
}: {
  assignmentId: string;
  hasSubmission: boolean;
  note: string | null;
}) {
  const [state, action] = useActionState<SubmitState, FormData>(
    submitAssignment,
    {},
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="assignmentId" value={assignmentId} />

      <div>
        <label htmlFor="file" className="text-sm font-semibold text-navy">
          {hasSubmission ? "Replace your file" : "Your file"}
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept={SUBMISSION_ACCEPT}
          className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy hover:file:bg-slate-200"
        />
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
          <Paperclip className="h-3 w-3" />
          PDF, Word, Excel, PowerPoint, CSV, ZIP or an image · max{" "}
          {MAX_SUBMISSION_MB} MB
          {hasSubmission && " · leave empty to keep the current file"}
        </p>
      </div>

      <div>
        <label htmlFor="note" className="text-sm font-semibold text-navy">
          Note <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          defaultValue={note ?? ""}
          placeholder="Anything you want the reviewer to know."
          className="mt-2 w-full resize-y rounded-xl border border-slate-200 p-3 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-primary"
        />
      </div>

      {state.error && (
        <p className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          Submitted. You can replace it until it is marked.
        </p>
      )}

      <Submit
        label={hasSubmission ? "Update submission" : "Submit assignment"}
      />
    </form>
  );
}
