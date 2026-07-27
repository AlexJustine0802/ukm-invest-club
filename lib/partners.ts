/**
 * The two partner groups the public site renders as separate sections.
 *
 * Defined once here so the admin dropdown, the stored value, and the section
 * headings can never disagree  the same reason lib/roles.ts owns the division
 * list rather than each page hardcoding it.
 */
export const PARTNER_CATEGORIES = [
  {
    value: "COMPANY",
    label: "Company Partners",
    blurb: "Institutions and firms we work with.",
  },
  {
    value: "COMMUNITY_MEDIA",
    label: "Community & Media Partners",
    blurb: "Communities and media that collaborate with us.",
  },
] as const;

export type PartnerCategory = (typeof PARTNER_CATEGORIES)[number]["value"];

/** Partners created before the field existed default to Company. */
export const DEFAULT_PARTNER_CATEGORY: PartnerCategory = "COMPANY";

export function isPartnerCategory(value: string): value is PartnerCategory {
  return PARTNER_CATEGORIES.some((c) => c.value === value);
}

/** Falls back rather than throwing: a bad value should not blank the section. */
export function toPartnerCategory(
  value: string | null | undefined,
): PartnerCategory {
  return value && isPartnerCategory(value) ? value : DEFAULT_PARTNER_CATEGORY;
}

export function partnerCategoryLabel(value: string | null | undefined): string {
  const c = toPartnerCategory(value);
  return PARTNER_CATEGORIES.find((x) => x.value === c)!.label;
}
