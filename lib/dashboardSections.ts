// One config drives the dashboard-content admin: which sections exist, what the
// generic DashboardItem fields mean in each, and which are shown in the form.

export type FieldKey =
  | "title"
  | "subtitle"
  | "meta"
  | "note"
  | "badge"
  | "icon"
  | "color"
  | "href";

export interface SectionConfig {
  id: string;
  label: string;
  description: string;
  /** Field key -> label shown in the admin form. Omitted fields are hidden. */
  fields: Partial<Record<FieldKey, string>>;
}

export const DASHBOARD_SECTIONS: SectionConfig[] = [
  {
    id: "overview",
    label: "Overview Stats",
    description: "The stat cards near the top of the member dashboard.",
    fields: {
      title: "Label (e.g. Resources Viewed)",
      subtitle: "Value (e.g. 12)",
      note: "Change note (e.g. ↑ 3 this week)",
      icon: "Icon",
      color: "Colour",
    },
  },
  {
    id: "announcement",
    label: "Announcements",
    description: "Shown in the dashboard rail and on the Announcements page.",
    fields: {
      title: "Title",
      subtitle: "Body",
      meta: "Extra detail (e.g. Deadline: 30 July 2025)",
      badge: "Category",
      note: "Age (e.g. 2h ago)",
      icon: "Icon",
      color: "Colour",
    },
  },
  {
    id: "resource",
    label: "Recent Resources",
    description: "Recently opened materials listed on the dashboard.",
    fields: {
      title: "Title",
      subtitle: "Lesson",
      badge: "Tag",
      note: "Age (e.g. Yesterday)",
      color: "Thumbnail colour",
    },
  },
  {
    id: "folder",
    label: "Resource Folders",
    description: "Folder cards on the member Resources page.",
    // No `meta` here on purpose: the item count is counted from the materials
    // actually in the folder, not typed in by hand. Icon, colour and order are
    // not asked for either  see FOLDER_STYLE in the dashboard-content actions.
    fields: {
      title: "Folder name",
      badge: "Category",
    },
  },
];

export function sectionConfig(id: string | undefined): SectionConfig {
  return (
    DASHBOARD_SECTIONS.find((s) => s.id === id) ?? DASHBOARD_SECTIONS[0]
  );
}

// Colour choices offered in the admin form, per how each section uses colour.
export const SOFT_COLORS = [
  { label: "Blue", value: "bg-blue-50 text-primary" },
  { label: "Green", value: "bg-emerald-50 text-emerald-600" },
  { label: "Amber", value: "bg-amber-50 text-amber-600" },
  { label: "Violet", value: "bg-violet-50 text-violet-600" },
  { label: "Red", value: "bg-red-50 text-red-600" },
  { label: "Slate", value: "bg-slate-100 text-slate-600" },
];

export const SOLID_COLORS = [
  { label: "Blue", value: "bg-blue-500" },
  { label: "Green", value: "bg-emerald-500" },
  { label: "Violet", value: "bg-violet-500" },
  { label: "Orange", value: "bg-orange-500" },
  { label: "Yellow", value: "bg-yellow-500" },
  { label: "Teal", value: "bg-teal-500" },
  { label: "Sky", value: "bg-sky-600" },
  { label: "Rose", value: "bg-rose-500" },
  { label: "Indigo", value: "bg-indigo-500" },
  { label: "Dark", value: "bg-slate-800" },
];

/** Sections whose colour is a solid block (thumbnail / folder header). */
export const SOLID_COLOR_SECTIONS = ["resource", "folder"];

export function colorOptions(section: string) {
  return SOLID_COLOR_SECTIONS.includes(section) ? SOLID_COLORS : SOFT_COLORS;
}
