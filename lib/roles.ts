// The club's org chart. A member has a division and a role within it; the role
// options offered are always derived from here, so the admin cannot invent a
// position that does not exist.
//
// Roles are not listed by hand. A division owns a list of *units* (its
// sub-divisions) and a structure, and every role name is generated from those:
//
//   EXECUTIVE          the units are the roles      President, Vice President
//   HEAD_MANAGER_STAFF Head + "<unit> Manager"      Head of Finance & Legality,
//                      + "<unit> Staff"             Legal Manager, Legal Staff
//   HEAD_STAFF         Head + "<unit> Staff"        Head of Project Management,
//                      (no manager tier)            Project Management Staff
//
// Generating them is what keeps the four levels below (roleLevel, reportsTo)
// true by construction: add a unit and its Manager, its Staff, the reporting
// line and the admin dropdown all follow. Hand-written role names drift.
//
// `slug` is the stored identity (User.division holds it) while `name` is only
// ever displayed. They are deliberately allowed to drift: renaming a division
// changes the label everywhere, whereas changing a slug silently orphans every
// member assigned to the old one. Rename freely; change a slug only alongside
// a data migration.

/** How a division's roles are built. See the table above. */
export type DivisionStructure =
  | "EXECUTIVE"
  | "HEAD_MANAGER_STAFF"
  | "HEAD_STAFF";

export interface DivisionRoles {
  slug: string;
  name: string;
  /**
   * The division's sub-divisions, e.g. "Legal", "Finance". Role names are
   * derived from these  never a full role title like "Legal Manager". The
   * exception is an EXECUTIVE division, where the units are the roles.
   */
  units: string[];
  structure: DivisionStructure;
  /** Blurb on the public About card. */
  description: string;
  /** Key from lib/uiIcons. */
  icon: string;
}

// The org chart is fixed in source on purpose  it is not admin-editable. A new
// division means a new entry here plus a deploy, so member roles, the About
// page and the recruitment page can never drift apart.
export const DIVISIONS: DivisionRoles[] = [
  {
    // Slug kept as "pvpc" from when this was PVPC: members are stored against
    // it, and the Controller seat leaving the chart does not change who they
    // are. Only the displayed name moved to PVP.
    //
    // The executive board sits above the divisions, so it has no Head, no
    // Manager and no Staff tier  President and Vice President are the roles.
    slug: "pvpc",
    name: "PVP",
    units: ["President", "Vice President"],
    structure: "EXECUTIVE",
    description:
      "The board. Sets direction for the club, represents it externally, and keeps every division accountable to the yearly plan.",
    icon: "Landmark",
  },
  {
    slug: "finance-legality",
    name: "Finance & Legality",
    units: ["Legal", "Finance"],
    structure: "HEAD_MANAGER_STAFF",
    description:
      "Runs the club treasury and keeps activities, agreements and paperwork on the right side of campus and legal rules.",
    icon: "FileSpreadsheet",
  },
  {
    slug: "human-resource-development",
    name: "Human Resource Development",
    units: ["People Growth & Experience", "Talent Performance & Acquisition"],
    structure: "HEAD_MANAGER_STAFF",
    description:
      "Recruits new members and looks after the people already here  onboarding, internal culture and growth through the year.",
    icon: "Users",
  },
  {
    // Business Development and External Relationship merged into one division.
    // Nobody was assigned to either slug, so this keeps the External
    // Relationship slug rather than inventing a third and stranding rows.
    slug: "external-relationship",
    name: "External Relationship & Business Development",
    units: [
      "Creative Entrepreneur",
      "Market Research & Collaboration",
      "Media Relations",
    ],
    structure: "HEAD_MANAGER_STAFF",
    description:
      "Owns everything outside the club  media, partners, campuses and the wider investment community  plus the ventures and market research behind where the club places its effort.",
    icon: "Handshake",
  },
  {
    slug: "creative-brand-marketing",
    name: "Creative Brand Marketing",
    units: ["Design Marketing", "Content & Publication Strategy"],
    structure: "HEAD_MANAGER_STAFF",
    description:
      "Shapes how the club looks and sounds: visual identity, campaigns, and the publication calendar across every channel.",
    icon: "Camera",
  },
  {
    // One operational division, not a Project arm and an Event arm: the same
    // people run both, so there is no manager tier to split them across.
    // Staff report straight to the Head.
    slug: "project-management",
    name: "Project Management",
    units: ["Project Management"],
    structure: "HEAD_STAFF",
    description:
      "Plans and runs the club's events end to end  seminars, workshops, competitions and everything on the day itself.",
    icon: "CalendarDays",
  },
  {
    slug: "research-development",
    name: "Research & Development",
    units: ["Investment Analyst", "Website Development"],
    structure: "HEAD_MANAGER_STAFF",
    description:
      "Produces the club's investment research and builds the tools behind it, this website included.",
    icon: "BarChart3",
  },
];

/** Sub-divisions line under a division name, e.g. "Legal, Finance". */
export function divisionTagline(division: DivisionRoles): string {
  return division.units.join(", ");
}

/** Roles with no division: what a new sign-up is, and people who have left. */
export const GENERAL_ROLES = ["Member", "Alumni"];

export function getDivision(
  slug: string | null | undefined,
): DivisionRoles | null {
  return DIVISIONS.find((d) => d.slug === slug) ?? null;
}

export function headTitle(division: DivisionRoles): string {
  return `Head of ${division.name}`;
}

export function managerTitle(unit: string): string {
  return `${unit} Manager`;
}

export function staffTitle(unit: string): string {
  return `${unit} Staff`;
}

/**
 * Every role a member of this division may hold, in org-chart order: head
 * first, then every manager, then every staff seat. sortDivisionPeople and the
 * admin dropdown both read this order, so the list reads top-down.
 */
export function rolesFor(slug: string | null | undefined): string[] {
  const division = getDivision(slug);
  if (!division) return GENERAL_ROLES;
  if (division.structure === "EXECUTIVE") return [...division.units];

  const head = headTitle(division);
  const staff = division.units.map(staffTitle);
  return division.structure === "HEAD_STAFF"
    ? [head, ...staff]
    : [head, ...division.units.map(managerTitle), ...staff];
}

/**
 * Every role that exists, chart order first and the division-less ones last.
 * Permission Management lists these, and they are unique across the whole
 * chart, which is what lets a role name be used as a permission key.
 */
export function allRoles(): string[] {
  return [...DIVISIONS.flatMap((d) => rolesFor(d.slug)), ...GENERAL_ROLES];
}

/** Reject anything not in the org chart, so User.role stays meaningful. */
export function isValidRole(
  role: string,
  divisionSlug: string | null,
): boolean {
  return rolesFor(divisionSlug).includes(role);
}

export function divisionName(slug: string | null | undefined): string | null {
  return getDivision(slug)?.name ?? null;
}

export function isHead(role: string): boolean {
  return role.startsWith("Head of ");
}

/**
 * The four rungs of the chart, most authority first. This is the field an RBAC
 * layer keys off: permissions attach to a level (or to a level within one
 * division), never to a role string, so adding a unit never means editing a
 * permission table.
 */
export const ROLE_LEVELS = [
  "EXECUTIVE",
  "HEAD",
  "MANAGER",
  "STAFF",
  "GENERAL",
] as const;

export type RoleLevel = (typeof ROLE_LEVELS)[number];

const EXECUTIVE_ROLES = DIVISIONS.filter(
  (d) => d.structure === "EXECUTIVE",
).flatMap((d) => d.units);

/**
 * Which rung a role sits on. Suffix matching is safe because every Manager and
 * Staff title is generated by managerTitle/staffTitle above  a unit is never
 * itself named "… Manager".
 *
 * "Member" and "Alumni" are GENERAL: on the chart at all, but below staff.
 */
export function roleLevel(role: string): RoleLevel {
  if (EXECUTIVE_ROLES.includes(role)) return "EXECUTIVE";
  if (isHead(role)) return "HEAD";
  if (role.endsWith(" Manager")) return "MANAGER";
  if (role.endsWith(" Staff")) return "STAFF";
  return "GENERAL";
}

/**
 * Rank for comparisons  lower outranks higher. Use it for "is this member at
 * least a Head?" checks rather than comparing level strings.
 */
export function levelRank(level: RoleLevel): number {
  return ROLE_LEVELS.indexOf(level);
}

export function outranks(role: string, other: string): boolean {
  return levelRank(roleLevel(role)) < levelRank(roleLevel(other));
}

/**
 * The single role this one reports to, or null at the top. Staff report to
 * their own unit's Manager; where the division has no manager tier they report
 * straight to the Head. Heads report to the President.
 */
export function reportsTo(
  role: string,
  divisionSlug: string | null | undefined,
): string | null {
  const division = getDivision(divisionSlug);
  const president = EXECUTIVE_ROLES[0] ?? null;

  switch (roleLevel(role)) {
    case "EXECUTIVE":
      // Vice President reports to the President; the President reports to
      // nobody inside the club.
      return role === president ? null : president;
    case "HEAD":
      return president;
    case "MANAGER":
      return division ? headTitle(division) : null;
    case "STAFF": {
      if (!division) return null;
      if (division.structure !== "HEAD_MANAGER_STAFF")
        return headTitle(division);
      const unit = division.units.find((u) => staffTitle(u) === role);
      return unit ? managerTitle(unit) : headTitle(division);
    }
    default:
      return null;
  }
}

/**
 * Order people the way the org chart reads: head first, then managers, then
 * staff in the order their units are listed above, then anyone else by name.
 */
export function sortDivisionPeople<T extends { name: string; role: string }>(
  people: T[],
  divisionSlug: string | null | undefined,
): T[] {
  const order = rolesFor(divisionSlug);
  const rank = (role: string) => {
    const index = order.indexOf(role);
    return index === -1 ? order.length : index;
  };
  return [...people].sort(
    (a, b) => rank(a.role) - rank(b.role) || a.name.localeCompare(b.name),
  );
}
