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
}

export const DIVISIONS: DivisionRoles[] = [
  {
    slug: "pvpc",
    name: "PVPC",
    positions: ["President", "Vice President", "Controller"],
    hasHead: false,
  },
  {
    slug: "finance-legality",
    name: "Finance & Legality",
    positions: ["Legal", "Finance"],
    hasHead: true,
  },
  {
    // Slugs match the Division rows so the public About page can join on them.
    slug: "human-resource-development",
    name: "Human Resource Development",
    positions: ["People Growth & Experience", "Talent Attraction & Acquisition"],
    hasHead: true,
  },
  {
    slug: "business-development",
    name: "Business Development",
    positions: ["Creative Entrepreneur", "Market Research & Strategy"],
    hasHead: true,
  },
  {
    slug: "external-relationship",
    name: "External Relationship",
    positions: ["Media Relations", "Collaboration & Network"],
    hasHead: true,
  },
  {
    slug: "creative-brand-marketing",
    name: "Creative Brand Marketing",
    positions: ["Design Marketing", "Content & Publication Strategy"],
    hasHead: true,
  },
  {
    slug: "project-event",
    name: "Project & Event",
    positions: ["Project & Event"],
    hasHead: true,
  },
  {
    slug: "research-development",
    name: "Research & Development",
    positions: ["Investment Analyst", "Website Development"],
    hasHead: true,
  },
];

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
