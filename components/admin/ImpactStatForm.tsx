"use client";

import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import { UI_ICON_KEYS } from "@/lib/uiIcons";

interface Props {
  action: (formData: FormData) => void;
  section: "home" | "research";
  stat?: { id: string; label: string; value: string; icon: string; order: number };
}

export default function ImpactStatForm({ action, section, stat }: Props) {
  const backHref =
    section === "research"
      ? "/admin/impact-stats?section=research"
      : "/admin/impact-stats";

  return (
    <form action={action} className="space-y-5">
      {stat && <input type="hidden" name="id" value={stat.id} />}
      <input type="hidden" name="section" value={section} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="value" className="label">
            Value (e.g. 350+)
          </label>
          <input
            id="value"
            name="value"
            required
            defaultValue={stat?.value}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="label" className="label">
            Label (e.g. Active Members)
          </label>
          <input
            id="label"
            name="label"
            required
            defaultValue={stat?.label}
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
            defaultValue={stat?.icon ?? "TrendingUp"}
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
          <label htmlFor="order" className="label">
            Display order
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={stat?.order ?? 0}
            className="input"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={stat ? "Save changes" : "Add stat"} />
        <Link href={backHref} className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
