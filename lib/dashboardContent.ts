import { prisma } from "@/lib/prisma";
import type { DashboardItem } from "@prisma/client";

/**
 * Fetch every active dashboard item for the given sections in one query and
 * group them by section, so a page needs a single round trip.
 */
export async function getSections(
  sections: string[],
): Promise<Record<string, DashboardItem[]>> {
  const items = await prisma.dashboardItem.findMany({
    where: { section: { in: sections }, active: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const grouped: Record<string, DashboardItem[]> = {};
  for (const section of sections) grouped[section] = [];
  for (const item of items) grouped[item.section]?.push(item);
  return grouped;
}

export async function getSection(section: string): Promise<DashboardItem[]> {
  return (await getSections([section]))[section];
}
