import { site } from "@/lib/site";

/** Destinations that may be assigned to public Home Hero buttons. */
export const PUBLIC_PAGE_OPTIONS = [
  ...site.nav,
  { label: "Community", href: "/community" },
] as const;

export function publicPageHref(value: string | null | undefined): string | null {
  const href = value?.trim();
  return href && PUBLIC_PAGE_OPTIONS.some((page) => page.href === href)
    ? href
    : null;
}
