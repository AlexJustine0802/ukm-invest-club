import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import { UI_ICON_KEYS } from "@/lib/uiIcons";
import { EVENT_COLOR_KEYS } from "@/lib/eventStyles";
import { toDateTimeLocalValue } from "@/lib/utils";

interface CareerAlertFormProps {
  action: (formData: FormData) => void;
  alert?: {
    id: string;
    company: string;
    role: string;
    location: string | null;
    workType: string;
    description: string | null;
    applyUrl: string | null;
    deadline: Date | null;
    icon: string | null;
    color: string | null;
    published: boolean;
    announced: boolean;
  };
}

export default function CareerAlertForm({ action, alert }: CareerAlertFormProps) {
  return (
    <form action={action} className="space-y-5">
      {alert && <input type="hidden" name="id" value={alert.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="role" className="label">
            Role
          </label>
          <input
            id="role"
            name="role"
            required
            defaultValue={alert?.role}
            placeholder="e.g. Equity Research Intern"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="company" className="label">
            Company
          </label>
          <input
            id="company"
            name="company"
            required
            defaultValue={alert?.company}
            placeholder="e.g. Mandiri Sekuritas"
            className="input"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="workType" className="label">
            Type
          </label>
          <input
            id="workType"
            name="workType"
            defaultValue={alert?.workType ?? "Internship"}
            placeholder="e.g. Internship, Full-time, Part-time"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="location" className="label">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={alert?.location ?? ""}
            placeholder="e.g. Jakarta (Hybrid)"
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
          rows={4}
          defaultValue={alert?.description ?? ""}
          placeholder="What the role involves, who it suits, requirements."
          className="input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="applyUrl" className="label">
            Apply link
          </label>
          <input
            id="applyUrl"
            name="applyUrl"
            type="url"
            defaultValue={alert?.applyUrl ?? ""}
            placeholder="https://..."
            className="input"
          />
        </div>
        <div>
          <label htmlFor="deadline" className="label">
            Application deadline <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="deadline"
            name="deadline"
            type="datetime-local"
            defaultValue={
              alert?.deadline ? toDateTimeLocalValue(alert.deadline) : undefined
            }
            className="input"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="icon" className="label">
            Icon
          </label>
          <select
            id="icon"
            name="icon"
            defaultValue={alert?.icon ?? "Briefcase"}
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
            defaultValue={alert?.color ?? EVENT_COLOR_KEYS[0]}
            className="input"
          >
            {EVENT_COLOR_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="published"
          defaultChecked={alert ? alert.published : true}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium text-navy">
          Published  visible on /account/career and pushed to the member
          notification bell for 14 days
        </span>
      </label>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="announced"
          defaultChecked={alert?.announced ?? false}
          className="mt-1 h-4 w-4"
        />
        <span className="text-sm font-medium text-navy">
          Announce this
          <span className="mt-0.5 block text-xs font-normal text-slate-500">
            Also lists it on the member Announcements page and dashboard rail.
            Can be switched on later from Announcements.
          </span>
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={alert ? "Save changes" : "Post job"} />
        <Link href="/admin/career" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
