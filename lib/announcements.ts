// What members see on the Announcements page and in the dashboard rail.
//
// Two kinds of announcement, one list:
//
//   written   a DashboardItem in the "announcement" section, typed by hand.
//   announced an event, recruitment round or career alert with its `announced`
//             switch on.
//
// The second kind is derived, never copied: announcing an event does not write
// a second row that then has to be edited again when the event date moves.

import { prisma } from "@/lib/prisma";
import { getSection } from "@/lib/dashboardContent";
import { formatDate } from "@/lib/utils";

/** Same shape as a DashboardItem row, so both kinds render identically. */
export interface Announcement {
  id: string;
  title: string;
  subtitle: string | null;
  meta: string | null;
  note: string | null;
  badge: string | null;
  icon: string | null;
  color: string | null;
  href: string | null;
  createdAt: Date;
}

/** Colour and icon are fixed per kind so the list reads as one thing. */
const STYLE = {
  Event: { icon: "CalendarDays", color: "bg-blue-50 text-primary" },
  Recruitment: { icon: "Search", color: "bg-violet-50 text-violet-600" },
  "Sign-up": { icon: "FileSpreadsheet", color: "bg-slate-100 text-slate-600" },
  Career: { icon: "Briefcase", color: "bg-emerald-50 text-emerald-600" },
} as const;

/** One line of extra detail, kept short  the rail has one line for it. */
function trim(text: string | null, max = 140): string | null {
  if (!text) return null;
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const [written, forms, alerts] = await Promise.all([
    getSection("announcement"),
    prisma.registrationForm.findMany({
      where: { announced: true, published: true },
      include: { event: true },
    }),
    prisma.careerAlert.findMany({
      where: { announced: true, published: true },
    }),
  ]);

  const derived: Announcement[] = [];

  for (const f of forms) {
    const badge = f.event ? "Event" : f.isRecruitment ? "Recruitment" : "Sign-up";
    derived.push({
      id: `form-${f.id}`,
      title: f.event?.title ?? f.title,
      subtitle: trim(f.event?.description ?? f.description),
      meta: f.event
        ? `${formatDate(f.event.eventDate)}${f.event.location ? ` · ${f.event.location}` : ""}`
        : f.closesAt
          ? `Closes ${formatDate(f.closesAt)}`
          : null,
      note: null,
      badge,
      ...STYLE[badge],
      href: f.event
        ? "/account/events"
        : f.isRecruitment
          ? "/account/recruitment"
          : `/account/register/${f.slug}`,
      createdAt: f.createdAt,
    });
  }

  for (const a of alerts) {
    derived.push({
      id: `career-${a.id}`,
      title: `${a.role} · ${a.company}`,
      subtitle: trim(a.description),
      meta: [a.workType, a.location, a.deadline && `Apply by ${formatDate(a.deadline)}`]
        .filter(Boolean)
        .join(" · ") || null,
      note: null,
      badge: "Career",
      ...STYLE.Career,
      href: "/account/career",
      createdAt: a.createdAt,
    });
  }

  // Written items keep their admin order and lead; the derived ones follow,
  // newest first, so turning a switch on never reshuffles the hand-typed list.
  derived.sort((x, y) => y.createdAt.getTime() - x.createdAt.getTime());
  return [...written.map((w) => ({ ...w, createdAt: w.createdAt })), ...derived];
}
