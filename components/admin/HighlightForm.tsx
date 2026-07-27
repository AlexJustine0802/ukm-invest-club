import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";

interface HighlightFormProps {
  action: (formData: FormData) => void;
  highlight?: {
    id: string;
    eyebrow: string;
    title: string;
    description: string | null;
    buttonLabel: string | null;
    buttonHref: string | null;
    noteTitle: string | null;
    noteBody: string | null;
    active: boolean;
  };
}

export default function HighlightForm({ action, highlight }: HighlightFormProps) {
  return (
    <form action={action} className="space-y-5">
      {highlight && <input type="hidden" name="id" value={highlight.id} />}

      <div>
        <label htmlFor="eyebrow" className="label">
          Label
        </label>
        <input
          id="eyebrow"
          name="eyebrow"
          required
          defaultValue={highlight?.eyebrow}
          placeholder="e.g. Open Recruitment"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="title" className="label">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={highlight?.title}
          placeholder="e.g. ICU Staff Recruitment 2025"
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
          defaultValue={highlight?.description ?? ""}
          placeholder="Short supporting sentence shown under the title."
          className="input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="buttonLabel" className="label">
            Button label
          </label>
          <input
            id="buttonLabel"
            name="buttonLabel"
            defaultValue={highlight?.buttonLabel ?? ""}
            placeholder="e.g. Apply Now"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="buttonHref" className="label">
            Button link
          </label>
          <input
            id="buttonHref"
            name="buttonHref"
            defaultValue={highlight?.buttonHref ?? ""}
            placeholder="e.g. /contact"
            className="input"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="noteTitle" className="label">
            Side note title <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="noteTitle"
            name="noteTitle"
            defaultValue={highlight?.noteTitle ?? ""}
            placeholder="e.g. Deadline"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="noteBody" className="label">
            Side note text <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="noteBody"
            name="noteBody"
            defaultValue={highlight?.noteBody ?? ""}
            placeholder="e.g. Closes 30 July 2025"
            className="input"
          />
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="active"
          defaultChecked={highlight ? highlight.active : true}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium text-navy">
          Active  show this on the member dashboard
        </span>
      </label>
      <p className="text-xs text-slate-500">
        If several highlights are active, the most recently created one is shown.
      </p>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={highlight ? "Save changes" : "Add highlight"} />
        <Link href="/admin/highlights" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
