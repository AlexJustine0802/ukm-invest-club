import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import CategorySelect from "@/components/admin/CategorySelect";
import { UI_ICON_KEYS } from "@/lib/uiIcons";
import { colorOptions, sectionConfig } from "@/lib/dashboardSections";
import { METRICS } from "@/lib/metrics";

interface DashboardItemFormProps {
  action: (formData: FormData) => void;
  section: string;
  /** Where Cancel goes. Defaults to the section's Dashboard Content list. */
  backTo?: string;
  /** Folder section only: the research categories to choose from. */
  categories?: string[];
  /** Omitted when the role may not add a research category. */
  createCategory?: (
    title: string,
  ) => Promise<{ value: string; label: string } | { error: string }>;
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
  backTo,
  categories = [],
  createCategory,
}: DashboardItemFormProps) {
  const config = sectionConfig(section);
  const fields = config.fields;
  const colors = colorOptions(section);
  const backHref = backTo ?? `/admin/dashboard-content?section=${section}`;

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
      {/* Folders file under the research categories the public site uses; every
          other section still types its own tag. */}
      {fields.badge && section === "folder" ? (
        <CategorySelect
          name="badge"
          label={fields.badge}
          defaultValue={item?.badge}
          options={categories.map((c) => ({ value: c, label: c }))}
          createAction={createCategory}
          hint="Also added to the research categories used on the public site."
        />
      ) : (
        textField("badge")
      )}
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

      {/* Folders list in the order they were created; nothing to type. */}
      {section !== "folder" && (
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
      )}

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
