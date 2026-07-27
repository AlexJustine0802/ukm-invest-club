// Every admin module and the actions it supports. This is the single source of
// truth for the permission system: the toggle grid in Permission Management,
// the sidebar filter, the division dashboard shortcuts and the guards on the
// server actions are all derived from this list.
//
// Adding a module means adding one entry here  it then automatically appears
// as a set of toggles, and its pages and actions can be guarded with the same
// `requirePermission(id, action)` call as everything else.
//
// `id` is stored inside RolePermission.permissions, so it is an identity: it
// may not be renamed without rewriting every saved row. `label` is display
// only and can change freely.

export const ACTIONS = [
  "access",
  "view",
  "create",
  "edit",
  "delete",
  "approve",
  "export",
  "manage",
] as const;

export type Action = (typeof ACTIONS)[number];

export const ACTION_LABELS: Record<Action, string> = {
  access: "Access",
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  approve: "Approve",
  export: "Export",
  manage: "Manage",
};

/**
 * The master switch: admin.access.
 *
 * A role holds this or it has no admin workspace at all  no Admin item in
 * the member sidebar, and every module permission below it counts for
 * nothing. Module toggles decide what someone can do once they are inside;
 * this decides whether they get in.
 *
 * It exists as its own permission so access can be withdrawn from a role in
 * one click without unpicking its module grid.
 */
export const ADMIN_ACCESS = { module: "admin", action: "access" } as const;

export interface AdminModule {
  /** Permission key. Stored in the database  never rename. */
  id: string;
  label: string;
  /** Where the module's list page lives. */
  href: string;
  /** Key from lib/uiIcons. */
  icon: string;
  /**
   * Which half of the admin the module belongs to. "core" is not a section of
   * the workspace  it is the switch that opens the workspace itself.
   */
  workspace: "public" | "dashboard" | "core";
  /** Only these actions are offered as toggles and accepted when saving. */
  actions: Action[];
  /**
   * Never delegable. These stay with the super admin whatever a stored row
   * claims  see the check in lib/adminAccess.ts.
   */
  superAdminOnly?: boolean;
  /** Shown under the label on the shortcut card and the toggle grid. */
  description: string;
}

const CRUD: Action[] = ["view", "create", "edit", "delete"];

export const ADMIN_MODULES: AdminModule[] = [
  {
    id: ADMIN_ACCESS.module,
    label: "Admin workspace",
    href: "/admin",
    icon: "Wrench",
    workspace: "core",
    actions: ["access"],
    description:
      "Lets this role open the Admin workspace from the member portal. Without it the sections below do nothing.",
  },

  // ---- Public website ----
  {
    id: "hero-slides",
    label: "Images",
    href: "/admin/hero-slides",
    icon: "Camera",
    workspace: "public",
    actions: CRUD,
    description: "Hero images on the home and about pages.",
  },
  {
    id: "impact-stats",
    label: "Impact Stats",
    href: "/admin/impact-stats",
    icon: "BarChart3",
    workspace: "public",
    actions: CRUD,
    description: "The counting number cards on home and research.",
  },
  {
    id: "community",
    label: "Community Moments",
    href: "/admin/community",
    icon: "Star",
    workspace: "public",
    actions: CRUD,
    description: "Photo moments in the about page gallery.",
  },
  {
    id: "partners",
    label: "Partners",
    href: "/admin/partners",
    icon: "Handshake",
    workspace: "public",
    actions: CRUD,
    description: "Company and community partner logos.",
  },
  {
    id: "publications",
    label: "Publications",
    href: "/admin/publications",
    icon: "FileText",
    workspace: "public",
    // "manage" is the featured picker  choosing which publications lead the
    // research page is a different job from writing them.
    actions: [...CRUD, "manage"],
    description: "Research write-ups and the featured picks.",
  },
  {
    id: "research-categories",
    label: "Research Categories",
    href: "/admin/research-categories",
    icon: "BookMarked",
    workspace: "public",
    actions: CRUD,
    description: "The taxonomy publications are filed under.",
  },
  {
    id: "events",
    label: "Events",
    href: "/admin/events",
    icon: "CalendarDays",
    workspace: "public",
    // Events are created and edited through their registration form, so this
    // module is a read-only list plus the featured picker.
    actions: ["view", "manage"],
    description: "The public event list and featured picks.",
  },
  {
    id: "event-categories",
    label: "Event Categories",
    href: "/admin/event-categories",
    icon: "CalendarCheck",
    workspace: "public",
    actions: CRUD,
    description: "The taxonomy events are filed under.",
  },

  // ---- Member dashboard ----
  {
    id: "highlights",
    label: "Highlights",
    href: "/admin/highlights",
    icon: "Megaphone",
    workspace: "dashboard",
    actions: CRUD,
    description: "The banner at the top of the member dashboard.",
  },
  {
    id: "assignments",
    label: "Assignments",
    href: "/admin/assignments",
    icon: "ClipboardList",
    workspace: "dashboard",
    // "approve" is marking submissions, which is separate from editing the
    // assignment itself.
    actions: [...CRUD, "approve"],
    description: "Member assignments and marking submissions.",
  },
  {
    id: "registrations",
    label: "Registration Forms",
    href: "/admin/registrations",
    icon: "FileSpreadsheet",
    workspace: "dashboard",
    actions: [...CRUD, "export"],
    description: "Sign-up forms, their responses and the CSV export.",
  },
  {
    id: "recruitment",
    label: "Recruitment",
    href: "/admin/recruitment",
    icon: "Search",
    workspace: "dashboard",
    // A view over the registration forms flagged isRecruitment; editing one
    // happens under Registration Forms.
    actions: ["view"],
    description: "The open recruitment round and its applicants.",
  },
  {
    id: "discussions",
    label: "Discussions",
    href: "/admin/discussions",
    icon: "MessageSquare",
    workspace: "dashboard",
    actions: CRUD,
    description: "Discussion channels members can join.",
  },
  {
    id: "career",
    label: "Career Alerts",
    href: "/admin/career",
    icon: "Briefcase",
    workspace: "dashboard",
    actions: CRUD,
    description: "Job and internship postings for members.",
  },
  {
    id: "dashboard-content",
    label: "Dashboard Content",
    href: "/admin/dashboard-content",
    icon: "FolderClosed",
    workspace: "dashboard",
    actions: CRUD,
    description: "Announcements, resources and dashboard stats.",
  },
  {
    id: "members",
    label: "Members",
    href: "/admin/members",
    icon: "Users",
    workspace: "dashboard",
    // Deliberately no create/edit/delete: changing someone's role or division
    // is reserved for the super admin, so it is not offered as a toggle at
    // all. A delegated role can look at the directory, nothing more.
    actions: ["view", "export"],
    description: "The member directory. Roles stay with the super admin.",
  },

  // ---- Never delegable ----
  {
    id: "settings",
    // Site settings have no page of their own; the form is mounted on the
    // images page.
    label: "Site Settings",
    href: "/admin/hero-slides",
    icon: "Wrench",
    workspace: "public",
    actions: [],
    superAdminOnly: true,
    description: "Site-wide images and configuration.",
  },
  {
    id: "member-roles",
    label: "Member Roles & Divisions",
    href: "/admin/members",
    icon: "Landmark",
    workspace: "dashboard",
    actions: [],
    superAdminOnly: true,
    description: "Assigning roles and divisions to members.",
  },
  {
    id: "permissions",
    label: "Permission Management",
    href: "/admin/members/permissions",
    icon: "Waypoints",
    workspace: "dashboard",
    actions: [],
    superAdminOnly: true,
    description: "What each role may do in the admin workspace.",
  },
];

export function moduleById(id: string): AdminModule | null {
  return ADMIN_MODULES.find((m) => m.id === id) ?? null;
}

export function actionsFor(id: string): Action[] {
  return moduleById(id)?.actions ?? [];
}

/** Modules a role can be granted. Never-delegable ones are not on the list. */
export const DELEGABLE_MODULES = ADMIN_MODULES.filter((m) => !m.superAdminOnly);

/** The sections of the workspace, i.e. everything except the access switch. */
export const SECTION_MODULES = DELEGABLE_MODULES.filter(
  (m) => m.workspace !== "core",
);

export type PermissionMap = Record<string, Action[]>;

/**
 * Read the stored JSON back into a permission map, dropping anything that is
 * not currently a real module/action pair.
 *
 * This is a security boundary, not tidying up: a row written before a module
 * was renamed, or hand-edited in the database, must never grant more than the
 * registry allows. Super-admin-only modules are dropped here too, so no stored
 * value can hand out site settings or role management.
 */
export function parsePermissions(value: unknown): PermissionMap {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: PermissionMap = {};

  for (const [moduleId, raw] of Object.entries(value as Record<string, unknown>)) {
    const found = moduleById(moduleId);
    if (!found || found.superAdminOnly) continue;
    if (!Array.isArray(raw)) continue;

    const actions = found.actions.filter((a) => raw.includes(a));
    if (actions.length > 0) out[moduleId] = actions;
  }

  return out;
}

/** Whether this permission map opens the admin workspace at all. */
export function hasAccess(map: PermissionMap): boolean {
  return map[ADMIN_ACCESS.module]?.includes(ADMIN_ACCESS.action) ?? false;
}

/** Total toggles switched on, for the "3 of 62" summary on the role list. */
export function countPermissions(map: PermissionMap): number {
  return Object.values(map).reduce((n, actions) => n + actions.length, 0);
}

export const TOTAL_PERMISSIONS = DELEGABLE_MODULES.reduce(
  (n, m) => n + m.actions.length,
  0,
);
