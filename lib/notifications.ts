import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getSection } from "@/lib/dashboardContent";
import { NEW_ALERT_DAYS, postedLabel } from "@/lib/career";
import { getUserSession } from "@/lib/userAuth";
import {
  assignmentKey,
  dueLabel,
  isDueSoon,
  memberState,
} from "@/lib/assignments";
import { formatDateTime } from "@/lib/utils";
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

  // Each source can be switched off in /admin/notifications. Missing row = all
  // on, which is what a site that has never opened that page expects.
  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  const on = (key: keyof NonNullable<typeof settings>) =>
    settings ? Boolean(settings[key]) : true;

  const [
    announcements,
    careerAlerts,
    marked,
    assignments,
    mySubmissions,
    events,
    materials,
    posts,
    recruitment,
  ] = await Promise.all([
    getSection("announcement"),
    on("notifyCareer")
      ? prisma.careerAlert.findMany({
          where: {
            published: true,
            createdAt: {
              gte: new Date(
                now.getTime() - NEW_ALERT_DAYS * 24 * 60 * 60 * 1000,
              ),
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : [],
    // Marking does not move an assignment out of Completed  the score arrives
    // here instead, so the member hears about it without the list changing
    // underneath them.
    session && on("notifyAssignments")
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
    // Every published assignment, so one that has just opened or fallen due
    // announces itself. Unread state is what keeps the list short, not a date
    // window  a member who never looked still sees it waiting.
    on("notifyAssignments")
      ? prisma.assignment.findMany({
          where: { published: true },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: { id: true, title: true, opensAt: true, dueDate: true },
        })
      : [],
    session
      ? prisma.assignmentSubmission.findMany({
          where: { userId: session.userId },
          select: { assignmentId: true, gradedAt: true },
        })
      : [],
    on("notifyEvents")
      ? prisma.event.findMany({
          where: { published: true, eventDate: { gte: now } },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, slug: true, title: true, eventDate: true },
        })
      : [],
    on("notifyMaterials")
      ? prisma.resourceMaterial.findMany({
          where: { active: true, folder: { active: true } },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            createdAt: true,
            folder: { select: { id: true, title: true } },
          },
        })
      : [],
    on("notifyDiscussions")
      ? prisma.discussionPost.findMany({
          where: { channel: { published: true } },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            createdAt: true,
            user: { select: { name: true } },
            channel: { select: { slug: true, name: true } },
          },
        })
      : [],
    // The open recruitment, if the window is running.
    on("notifyRecruitment")
      ? prisma.registrationForm.findFirst({
          where: {
            isRecruitment: true,
            published: true,
            OR: [{ opensAt: null }, { opensAt: { lte: now } }],
            AND: [{ OR: [{ closesAt: null }, { closesAt: { gte: now } }] }],
          },
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, closesAt: true },
        })
      : null,
  ]);

  const submissionFor = new Map(
    mySubmissions.map((s) => [s.assignmentId, s]),
  );

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
    ...assignments.map((a) => {
      const state = memberState(a.opensAt, submissionFor.get(a.id), now);
      return {
        id: assignmentKey(a.id),
        title:
          state === "COMPLETED"
            ? `Handed in: ${a.title}`
            : `New assignment: ${a.title}`,
        body:
          state === "UPCOMING"
            ? `Opens ${formatDateTime(a.opensAt!)}`
            : state === "COMPLETED"
              ? "Waiting to be marked"
              : dueLabel(a.dueDate, now),
        ago: isDueSoon(a.dueDate, state, now) ? "Due soon" : "",
        icon: "ClipboardList",
        color:
          state === "UPCOMING"
            ? "bg-violet-50 text-violet-600"
            : "bg-blue-50 text-primary",
        href: `/account/assignments/${a.id}`,
      };
    }),
    ...marked.map((m) => ({
      id: `graded-${m.id}`,
      title: `Marked: ${m.assignment.title}`,
      body: m.score !== null ? `You scored ${m.score}` : "Your work was reviewed",
      ago: postedLabel(m.gradedAt!, now).replace("Posted", "Marked"),
      icon: "GraduationCap",
      color: "bg-blue-50 text-primary",
      href: `/account/assignments/${m.assignment.id}`,
    })),
    ...(recruitment
      ? [
          {
            id: `recruitment-${recruitment.id}`,
            title: `Recruitment open: ${recruitment.title}`,
            body: recruitment.closesAt
              ? `Closes ${formatDateTime(recruitment.closesAt)}`
              : "Applications are open",
            ago: "",
            icon: "ClipboardList",
            color: "bg-amber-50 text-amber-600",
            href: "/account/recruitment",
          },
        ]
      : []),
    ...events.map((e) => ({
      id: `event-${e.id}`,
      title: `New event: ${e.title}`,
      body: formatDateTime(e.eventDate),
      ago: postedLabel(e.eventDate, now).replace("Posted", "Happens"),
      icon: "CalendarDays",
      color: "bg-sky-50 text-sky-700",
      href: `/account/events`,
    })),
    ...materials.map((m) => ({
      id: `material-${m.id}`,
      title: `New material: ${m.title}`,
      body: `In ${m.folder.title}`,
      ago: postedLabel(m.createdAt, now),
      icon: "FolderClosed",
      color: "bg-violet-50 text-violet-600",
      href: `/account/resources/${m.folder.id}`,
    })),
    ...posts.map((p) => ({
      id: `post-${p.id}`,
      title: `New in ${p.channel.name}`,
      body: `${p.user.name} posted`,
      ago: postedLabel(p.createdAt, now),
      icon: "MessageSquare",
      color: "bg-emerald-50 text-emerald-700",
      href: `/account/discussions/${p.channel.slug}`,
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
