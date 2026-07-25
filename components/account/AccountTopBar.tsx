import { Suspense } from "react";
import TopBarMenus from "./TopBarMenus";
import TopBarSearch from "./TopBarSearch";
import { getSection } from "@/lib/dashboardContent";
import { prisma } from "@/lib/prisma";
import { NEW_ALERT_DAYS, postedLabel } from "@/lib/career";
import type { TopBarNotification } from "./TopBarMenus";

export default async function AccountTopBar({
  title,
  subtitle,
  searchPlaceholder = "Search resources, events, or anything...",
  showSearch = true,
  name,
  initial,
  role,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  searchPlaceholder?: string;
  /** Off on pages with nothing to filter. */
  showSearch?: boolean;
  name: string;
  initial: string;
  role: string;
}) {
  // The bell mirrors announcements plus any recent job posting, so publishing a
  // career alert announces itself — no second row for the admin to write.
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

  const notifications: TopBarNotification[] = [
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

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {showSearch && (
          <Suspense
            fallback={<div className="h-11 w-full rounded-full border border-slate-200 bg-white lg:w-96" />}
          >
            <TopBarSearch placeholder={searchPlaceholder} />
          </Suspense>
        )}
        <TopBarMenus
          name={name}
          initial={initial}
          role={role}
          notifications={notifications}
        />
      </div>
    </div>
  );
}
