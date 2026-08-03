// The banner at the top of the member dashboard.
//
// Same two kinds as announcements (see lib/announcements.ts):
//
//   written     an active Highlight row, typed in the admin.
//   highlighted an event, recruitment round or career alert with its
//               `highlighted` switch on.
//
// Only one banner fits, so the newest wins. Derived banners are read live: move
// an event and the banner moves with it.

import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export interface Banner {
  id: string;
  eyebrow: string;
  title: string;
  description: string | null;
  buttonLabel: string | null;
  buttonHref: string | null;
  noteTitle: string | null;
  noteBody: string | null;
  createdAt: Date;
}

function trim(text: string | null, max = 200): string | null {
  if (!text) return null;
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

/** Every banner currently switched on, newest first. */
export async function getBanners(): Promise<Banner[]> {
  const [written, forms, alerts] = await Promise.all([
    prisma.highlight.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.registrationForm.findMany({
      where: { highlighted: true, published: true },
      include: { event: true },
    }),
    prisma.careerAlert.findMany({
      where: { highlighted: true, published: true },
    }),
  ]);

  const banners: Banner[] = written.map((h) => ({
    id: h.id,
    eyebrow: h.eyebrow,
    title: h.title,
    description: h.description,
    buttonLabel: h.buttonLabel,
    buttonHref: h.buttonHref,
    noteTitle: h.noteTitle,
    noteBody: h.noteBody,
    createdAt: h.createdAt,
  }));

  for (const f of forms) {
    const isEvent = Boolean(f.event);
    banners.push({
      id: `form-${f.id}`,
      eyebrow: isEvent ? "Event" : f.isRecruitment ? "Open Recruitment" : "Sign-up",
      title: f.event?.title ?? f.title,
      description: trim(f.event?.description ?? f.description),
      buttonLabel: isEvent
        ? "See the event"
        : f.isRecruitment
          ? "Apply now"
          : "Open the form",
      buttonHref: isEvent
        ? "/account/events"
        : f.isRecruitment
          ? "/account/recruitment"
          : `/register/${f.slug}`,
      noteTitle: f.event ? "When" : f.closesAt ? "Closes" : null,
      noteBody: f.event
        ? `${formatDate(f.event.eventDate)}${f.event.location ? ` · ${f.event.location}` : ""}`
        : f.closesAt
          ? formatDate(f.closesAt)
          : null,
      createdAt: f.createdAt,
    });
  }

  for (const a of alerts) {
    banners.push({
      id: `career-${a.id}`,
      eyebrow: "Career Alert",
      title: `${a.role} · ${a.company}`,
      description: trim(a.description),
      buttonLabel: "See the posting",
      buttonHref: "/account/career",
      noteTitle: a.deadline ? "Apply by" : null,
      noteBody: a.deadline ? formatDate(a.deadline) : null,
      createdAt: a.createdAt,
    });
  }

  return banners.sort((x, y) => y.createdAt.getTime() - x.createdAt.getTime());
}

/** The one banner the dashboard shows, or null when nothing is switched on. */
export async function getBanner(): Promise<Banner | null> {
  return (await getBanners())[0] ?? null;
}
