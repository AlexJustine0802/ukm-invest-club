import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import { UI_ICON_KEYS } from "@/lib/uiIcons";
import { SOFT_COLORS } from "@/lib/dashboardSections";
import { ASSIGNMENT_STATUSES } from "@/lib/assignments";

interface AssignmentFormProps {
  action: (formData: FormData) => void;
  assignment?: {
    id: string;
    title: string;
    category: string;
    workType: string;
    description: string | null;
    dueDate: Date;
    status: string;
    icon: string | null;
    color: string | null;
    href: string | null;
    order: number;
    published: boolean;
  };
}

/** yyyy-MM-ddTHH:mm in local time, which is what datetime-local expects. */
function toLocalInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function AssignmentForm({
  action,
  assignment,
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="label">
            Category
          </label>
          <input
            id="category"
            name="category"
            required
            defaultValue={assignment?.category}
            placeholder="e.g. Financial Analysis"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="workType" className="label">
            Work type
          </label>
          <input
            id="workType"
            name="workType"
            defaultValue={assignment?.workType ?? "Individual"}
            placeholder="e.g. Individual or Group (3–4 members)"
            className="input"
          />
        </div>
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

      <div className="grid gap-4 sm:grid-cols-2">
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
          <p className="mt-1 text-xs text-slate-500">
            “Due in N days” and the Due Soon tab are worked out from this.
          </p>
        </div>
        <div>
          <label htmlFor="status" className="label">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={assignment?.status ?? "ACTIVE"}
            className="input"
          >
            {ASSIGNMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="icon" className="label">
            Icon
          </label>
          <select
            id="icon"
            name="icon"
            defaultValue={assignment?.icon ?? UI_ICON_KEYS[0]}
            className="input"
          >
            {UI_ICON_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="color" className="label">
            Colour
          </label>
          <select
            id="color"
            name="color"
            defaultValue={assignment?.color ?? SOFT_COLORS[0].value}
            className="input"
          >
            {SOFT_COLORS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="order" className="label">
            Display order
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={assignment?.order ?? 0}
            className="input"
          />
        </div>
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
