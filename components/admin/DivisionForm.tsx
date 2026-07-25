import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import { UI_ICON_KEYS } from "@/lib/uiIcons";

interface DivisionFormProps {
  action: (formData: FormData) => void;
  division?: {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    icon: string | null;
    order: number;
  };
}

export default function DivisionForm({ action, division }: DivisionFormProps) {
  return (
    <form action={action} className="space-y-5">
      {division && <input type="hidden" name="id" value={division.id} />}

      <div>
        <label htmlFor="name" className="label">
          Division name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={division?.name}
          placeholder="e.g. Human Resource Development"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="tagline" className="label">
          Sub-roles <span className="text-slate-400">(shown under the name)</span>
        </label>
        <input
          id="tagline"
          name="tagline"
          defaultValue={division?.tagline ?? ""}
          placeholder="e.g. People Growth & Experience, Talent Attraction"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="description" className="label">
          Explanation
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={division?.description ?? ""}
          placeholder="What this division does — shown when a visitor opens it."
          className="input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="icon" className="label">
            Icon
          </label>
          <select
            id="icon"
            name="icon"
            defaultValue={division?.icon ?? UI_ICON_KEYS[0]}
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
          <label htmlFor="slug" className="label">
            Slug <span className="text-slate-400">(auto)</span>
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={division?.slug ?? ""}
            placeholder="auto from name"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="order" className="label">
            Display order
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={division?.order ?? 0}
            className="input"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={division ? "Save changes" : "Add division"} />
        <Link href="/admin/divisions" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
