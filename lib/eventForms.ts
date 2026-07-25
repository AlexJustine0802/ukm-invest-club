import type { Prisma, PrismaClient } from "@prisma/client";
import { defaultEventQuestions } from "@/lib/forms";

/**
 * Every event registers through a form. If an event has none linked yet, make
 * one from the default question set so "Register" always opens something real;
 * the admin can then edit its questions under Registrations.
 *
 * Returns the linked form's slug.
 */
export async function ensureEventForm(
  db: PrismaClient,
  event: {
    id: string;
    title: string;
    slug: string;
    eventDate: Date;
    capacity: number | null;
    registrationFormId: string | null;
  },
): Promise<string> {
  if (event.registrationFormId) {
    const existing = await db.registrationForm.findUnique({
      where: { id: event.registrationFormId },
      select: { slug: true },
    });
    if (existing) return existing.slug;
  }

  // Keep the form slug distinct from the event's own /events/<slug> page.
  const slug = await uniqueFormSlug(db, `${event.slug}-registration`);

  const form = await db.registrationForm.create({
    data: {
      title: `${event.title} — Registration`,
      slug,
      description: `Sign-up form for ${event.title}.`,
      audience: "BOTH", // members and the public can both attend an event
      multipleResponses: false,
      questions: defaultEventQuestions() as unknown as Prisma.InputJsonValue,
      closesAt: event.eventDate, // stops taking sign-ups once the event starts
      capacity: event.capacity,
      published: true,
      icon: "CalendarDays",
    },
    select: { id: true, slug: true },
  });

  await db.event.update({
    where: { id: event.id },
    data: { registrationFormId: form.id },
  });

  return form.slug;
}

async function uniqueFormSlug(db: PrismaClient, base: string): Promise<string> {
  let slug = base;
  let n = 1;
  while (await db.registrationForm.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${++n}`;
  }
  return slug;
}
