import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSection } from "@/lib/dashboardContent";
import { NEW_ALERT_DAYS, postedLabel } from "@/lib/career";
import type { TopBarNotification } from "@/components/account/TopBarMenus";

/**
 * Bell contents: announcements plus any recent job posting, so publishing a
 * career alert announces itself — no second row for the admin to write.
 *
 * Lives here rather than in AccountTopBar because the mobile nav bar renders
 * the same menu, and both need the identical list.
 */
export const getTopBarNotifications = cache(async function getTopBarNotifications(): Promise<
  TopBarNotification[]
> {
  const now = new Date();
  const [announcements, careerAlerts] = await Promise.all([
    getSection("announcement"),
    prisma.careerAlert.findMany({
      where: {
        published: true,
        createdAt: {
          gte: new Date(now.getTime() - NEW_ALERT_DAYS * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return [
    ...careerAlerts.map((c) => ({
      id: c.id,
      title: `New opening: ${c.role}`,
      body: c.location ? `${c.company} · ${c.location}` : c.company,
      ago: postedLabel(c.createdAt, now),
      icon: c.icon ?? "Briefcase",
      color: "bg-emerald-50 text-emerald-700",
      href: "/account/career",
    })),
    ...announcements.slice(0, 8).map((a) => ({
      id: a.id,
      title: a.title,
      body: a.subtitle ?? "",
      ago: a.note ?? "",
      icon: a.icon,
      color: a.color ?? "bg-blue-50 text-primary",
      href: "/account/announcements",
    })),
  ];
});
