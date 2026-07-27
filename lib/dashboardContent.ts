import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { DashboardItem } from "@prisma/client";

/**
 * Every active dashboard item, fetched once per request.
 *
 * The layout and the page both want dashboard content, and keying the cache on
 * the section list would miss (they ask for different sections). Fetching the
 * whole active set instead means one query per request however many callers
 * there are  which matters because the connection pool is small.
 */
const getActiveItems = cache(
  async (): Promise<DashboardItem[]> =>
    prisma.dashboardItem.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
);

/** Active items for the given sections, grouped by section. */
export async function getSections(
  sections: string[],
): Promise<Record<string, DashboardItem[]>> {
  const items = await getActiveItems();

  const grouped: Record<string, DashboardItem[]> = {};
  for (const section of sections) grouped[section] = [];
  for (const item of items) grouped[item.section]?.push(item);
  return grouped;
}

export async function getSection(section: string): Promise<DashboardItem[]> {
  return (await getSections([section]))[section];
}
