import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSection } from "@/lib/dashboardContent";
import { NEW_ALERT_DAYS, postedLabel } from "@/lib/career";
import { getUserSession } from "@/lib/userAuth";
import type { TopBarNotification } from "@/components/account/TopBarMenus";

/**
 * Bell contents: announcements plus any recent job posting, so publishing a
 * career alert announces itself  no second row for the admin to write.
 *
 * Lives here rather than in AccountTopBar because the mobile nav bar renders
 * the same menu, and both need the identical list.
 */
export const getTopBarNotifications = cache(async function getTopBarNotifications(): Promise<
  TopBarNotification[]
> {
  const now = new Date();
  const session = await getUserSession();

  const [announcements, careerAlerts, marked] = await Promise.all([
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
    // Marking does not move an assignment out of Completed  the score arrives
    // here instead, so the member hears about it without the list changing
    // underneath them.
    session
      ? prisma.assignmentSubmission.findMany({
          where: { userId: session.userId, gradedAt: { not: null } },
          orderBy: { gradedAt: "desc" },
          take: 5,
          select: {
            id: true,
            score: true,
            gradedAt: true,
            assignment: { select: { id: true, title: true } },
          },
        })
      : [],
  ]);

  // No row = unread, so a new notification needs nothing written to appear.
  const readKeys = new Set(
    session
      ? (
          await prisma.notificationRead.findMany({
            where: { userId: session.userId },
            select: { key: true },
          })
        ).map((r) => r.key)
      : [],
  );

  const list: Omit<TopBarNotification, "read">[] = [
    ...marked.map((m) => ({
      id: `graded-${m.id}`,
      title: `Marked: ${m.assignment.title}`,
      body: m.score !== null ? `You scored ${m.score}` : "Your work was reviewed",
      ago: postedLabel(m.gradedAt!, now).replace("Posted", "Marked"),
      icon: "GraduationCap",
      color: "bg-blue-50 text-primary",
      href: `/account/assignments/${m.assignment.id}`,
    })),
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

  return list.map((n) => ({ ...n, read: readKeys.has(n.id) }));
});
