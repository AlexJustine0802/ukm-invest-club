import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";

interface AssignmentFormProps {
  action: (formData: FormData) => void;
  /**
   * Category, work type, status, icon, colour and display order are no longer
   * asked for: every assignment uses the same icon, and status follows each
   * member's own submission. The columns stay in the database untouched.
   */
  assignment?: {
    id: string;
    title: string;
    description: string | null;
    opensAt: Date | null;
    dueDate: Date;
    href: string | null;
    fileUrl: string | null;
    fileName: string | null;
    published: boolean;
  };
  /** Whether file uploads are configured (Vercel Blob). */
  uploadEnabled?: boolean;
}

/** yyyy-MM-ddTHH:mm in local time, which is what datetime-local expects. */
function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AssignmentForm({
  action,
  assignment,
  uploadEnabled = false,
}: AssignmentFormProps) {
  return (
    <form action={action} className="space-y-5">
      {assignment && <input type="hidden" name="id" value={assignment.id} />}

      <div>
        <label htmlFor="title" className="label">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={assignment?.title}
          placeholder="e.g. Company Analysis Report"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={assignment?.description ?? ""}
          className="input"
        />
      </div>

      {/* Gates the field under it: unticked, the date is ignored and the
          assignment accepts work as soon as it is published. */}
      <div className="rounded-lg border border-slate-200 p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="hasOpenDate"
            defaultChecked={Boolean(assignment?.opensAt)}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            <span className="text-sm font-semibold text-navy">
              Opens at a set time
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Members see the assignment straight away but cannot submit until
              then. Leave unticked to accept work immediately.
            </span>
          </span>
        </label>

        <div className="mt-4">
          <label htmlFor="opensAt" className="label">
            Opens
          </label>
          <input
            id="opensAt"
            name="opensAt"
            type="datetime-local"
            defaultValue={
              assignment?.opensAt ? toLocalInput(assignment.opensAt) : undefined
            }
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="label">
          Due date &amp; time
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="datetime-local"
          required
          defaultValue={
            assignment ? toLocalInput(assignment.dueDate) : undefined
          }
          className="input"
        />
      </div>

      {/* The question paper. Uploading a new one replaces the old; the tickbox
          is the only way to end up with no file at all. */}
      <div className="rounded-lg border border-slate-200 p-4">
        <label htmlFor="file" className="label">
          Question file <span className="text-slate-400">(optional)</span>
        </label>
        {assignment?.fileUrl && (
          <p className="mb-2 text-xs text-slate-500">
            Current:{" "}
            <a
              href={assignment.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              {assignment.fileName ?? "Uploaded file"}
            </a>
          </p>
        )}
        <input
          id="file"
          name="file"
          type="file"
          disabled={!uploadEnabled}
          className="input file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold"
        />
        {assignment?.fileUrl && (
          <label className="mt-3 flex items-center gap-3">
            <input type="checkbox" name="removeFile" className="h-4 w-4" />
            <span className="text-sm font-medium text-navy">
              Remove the current file
            </span>
          </label>
        )}
      </div>

      <div>
        <label htmlFor="href" className="label">
          Link <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="href"
          name="href"
          defaultValue={assignment?.href ?? ""}
          placeholder="e.g. a submission form URL"
          className="input"
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="published"
          defaultChecked={assignment ? assignment.published : true}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium text-navy">
          Published  visible to members
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={assignment ? "Save changes" : "Add assignment"} />
        <Link href="/admin/assignments" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
