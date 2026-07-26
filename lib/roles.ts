// The club's org chart. A member has a division and a role within it; the role
// options offered are always derived from here, so the admin cannot invent a
// position that does not exist.
//
// PVPC is the only division without a "Head of …" — its positions already are
// the leadership.

export interface DivisionRoles {
  slug: string;
  name: string;
  /** Positions inside the division, excluding the head. */
  positions: string[];
  /** False only for PVPC. */
  hasHead: boolean;
  /** Blurb on the public About card. */
  description: string;
  /** Key from lib/uiIcons. */
  icon: string;
}

// The org chart is fixed in source on purpose — it is not admin-editable. A new
// division means a new entry here plus a deploy, so member roles, the About
// page and the recruitment page can never drift apart.
export const DIVISIONS: DivisionRoles[] = [
  {
    slug: "pvpc",
    name: "PVPC",
    positions: ["President", "Vice President", "Controller"],
    hasHead: false,
    description:
      "The board. Sets direction for the club, represents it externally, and keeps every division accountable to the yearly plan.",
    icon: "Landmark",
  },
  {
    slug: "finance-legality",
    name: "Finance & Legality",
    positions: ["Legal", "Finance"],
    hasHead: true,
    description:
      "Runs the club treasury and keeps activities, agreements and paperwork on the right side of campus and legal rules.",
    icon: "FileSpreadsheet",
  },
  {
    slug: "human-resource-development",
    name: "Human Resource Development",
    positions: ["People Growth & Experience", "Talent Attraction & Acquisition"],
    hasHead: true,
    description:
      "Recruits new members and looks after the people already here — onboarding, internal culture and growth through the year.",
    icon: "Users",
  },
  {
    slug: "business-development",
    name: "Business Development",
    positions: ["Creative Entrepreneur", "Market Research & Strategy"],
    hasHead: true,
    description:
      "Builds the club's revenue side: sponsorship, ventures, and the market research behind where to place the effort.",
    icon: "TrendingUp",
  },
  {
    slug: "external-relationship",
    name: "External Relationship",
    positions: ["Media Relations", "Collaboration & Network"],
    hasHead: true,
    description:
      "Owns relationships outside the club — media, partner organisations, campuses and the wider investment community.",
    icon: "Handshake",
  },
  {
    slug: "creative-brand-marketing",
    name: "Creative Brand Marketing",
    positions: ["Design Marketing", "Content & Publication Strategy"],
    hasHead: true,
    description:
      "Shapes how the club looks and sounds: visual identity, campaigns, and the publication calendar across every channel.",
    icon: "Camera",
  },
  {
    slug: "project-event",
    name: "Project & Event",
    positions: ["Project & Event"],
    hasHead: true,
    description:
      "Plans and runs the club's events end to end — seminars, workshops, competitions and everything on the day itself.",
    icon: "CalendarDays",
  },
  {
    slug: "research-development",
    name: "Research & Development",
    positions: ["Investment Analyst", "Website Development"],
    hasHead: true,
    description:
      "Produces the club's investment research and builds the tools behind it, this website included.",
    icon: "BarChart3",
  },
];

/** Sub-roles line under a division name, e.g. "Legal, Finance". */
export function divisionTagline(division: DivisionRoles): string {
  return division.positions.join(", ");
}

/** Roles with no division: what a new sign-up is, and people who have left. */
export const GENERAL_ROLES = ["Member", "Alumni"];

export function getDivision(slug: string | null | undefined): DivisionRoles | null {
  return DIVISIONS.find((d) => d.slug === slug) ?? null;
}

export function headTitle(division: DivisionRoles): string {
  return `Head of ${division.name}`;
}

/** Every role a member of this division may hold, head first. */
export function rolesFor(slug: string | null | undefined): string[] {
  const division = getDivision(slug);
  if (!division) return GENERAL_ROLES;
  return division.hasHead
    ? [headTitle(division), ...division.positions]
    : [...division.positions];
}

/** Reject anything not in the org chart, so User.role stays meaningful. */
export function isValidRole(role: string, divisionSlug: string | null): boolean {
  return rolesFor(divisionSlug).includes(role);
}

export function divisionName(slug: string | null | undefined): string | null {
  return getDivision(slug)?.name ?? null;
}

export function isHead(role: string): boolean {
  return role.startsWith("Head of ");
}

/**
 * Order people the way the org chart reads: head first, then the division's
 * positions in the order they are listed above, then anyone else by name.
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
