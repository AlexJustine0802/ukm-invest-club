import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import { UI_ICON_KEYS } from "@/lib/uiIcons";
import { colorOptions, sectionConfig } from "@/lib/dashboardSections";
import { METRICS } from "@/lib/metrics";

interface DashboardItemFormProps {
  action: (formData: FormData) => void;
  section: string;
  item?: {
    id: string;
    title: string;
    subtitle: string | null;
    meta: string | null;
    note: string | null;
    badge: string | null;
    icon: string | null;
    color: string | null;
    href: string | null;
    order: number;
    active: boolean;
    metric: string | null;
  };
}

export default function DashboardItemForm({
  action,
  section,
  item,
}: DashboardItemFormProps) {
  const config = sectionConfig(section);
  const fields = config.fields;
  const colors = colorOptions(section);
  const backHref = `/admin/dashboard-content?section=${section}`;

  const textField = (
    key: "title" | "subtitle" | "meta" | "note" | "badge" | "href",
    required = false,
  ) => {
    const label = fields[key];
    if (!label) return null;
    return (
      <div key={key}>
        <label htmlFor={key} className="label">
          {label}
        </label>
        <input
          id={key}
          name={key}
          required={required}
          defaultValue={item?.[key] ?? ""}
          className="input"
        />
      </div>
    );
  };

  return (
    <form action={action} className="space-y-5">
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="section" value={section} />

      {textField("title", true)}

      {section === "overview" && (
        <div>
          <label htmlFor="metric" className="label">
            Live value
          </label>
          <select
            id="metric"
            name="metric"
            defaultValue={item?.metric ?? ""}
            className="input"
          >
            <option value="">Off  use the typed value below</option>
            {METRICS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Pick one and the card counts itself  publish a career alert or an
            event and the number updates on its own.
          </p>
        </div>
      )}

      {textField("subtitle")}
      {textField("meta")}
      {textField("note")}
      {textField("badge")}
      {textField("href")}

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.icon && (
          <div>
            <label htmlFor="icon" className="label">
              {fields.icon}
            </label>
            <select
              id="icon"
              name="icon"
              defaultValue={item?.icon ?? UI_ICON_KEYS[0]}
              className="input"
            >
              {UI_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        )}

        {fields.color && (
          <div>
            <label htmlFor="color" className="label">
              {fields.color}
            </label>
            <select
              id="color"
              name="color"
              defaultValue={item?.color ?? colors[0].value}
              className="input"
            >
              {colors.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="order" className="label">
          Display order
        </label>
        <input
          id="order"
          name="order"
          type="number"
          defaultValue={item?.order ?? 0}
          className="input"
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="active"
          defaultChecked={item ? item.active : true}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium text-navy">
          Active  show this on the member dashboard
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={item ? "Save changes" : `Add ${config.label.toLowerCase()}`} />
        <Link href={backHref} className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
