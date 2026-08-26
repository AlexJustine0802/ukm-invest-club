import type { Prisma } from "@prisma/client";
import { parseWallClockDateTime } from "@/lib/wallClock";

/**
 * A registration form and its public event are one record split across two
 * tables: the form holds the sign-up side, the event holds the public listing.
 * The form is the source of truth  every write goes through here, so the two
 * can never drift.
 *
 * Shared fields (title, slug, description, cover, capacity, published) are
 * copied from the form. The rest are event-only and come from the same submit.
 */

export interface EventDetails {
  eventDate: Date;
  endDate: Date | null;
  location: string | null;
  categoryId: string | null;
  seatUnit: string;
}

export interface FormSource {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  capacity: number | null;
  published: boolean;
}

function parseEventDateTime(value: string): Date {
  return parseWallClockDateTime(value);
}

type Db = Prisma.TransactionClient;

/**
 * Pull the event fields off a submitted form. Returns null when the admin did
 * not tick "show on the public Events page", or ticked it but left the start
 * date blank  either way the form is a plain sign-up (recruitment,
 * standalone) and gets no public event.
 *
 * The tickbox is what decides. A recruitment form can carry dates for its own
 * open/close window without that putting it on the public site.
 */
export function readEventDetails(formData: FormData): EventDetails | null {
  if (!formData.get("showOnEvents")) return null;

  const start = (formData.get("eventDate") as string)?.trim();
  if (!start) return null;

  const end = (formData.get("endDate") as string)?.trim();
  return {
    eventDate: parseEventDateTime(start),
    endDate: end ? parseEventDateTime(end) : null,
    location: (formData.get("location") as string)?.trim() || null,
    categoryId: (formData.get("categoryId") as string)?.trim() || null,
    seatUnit: (formData.get("seatUnit") as string)?.trim() || "seats",
  };
}

/** The event page lives at /events/<slug>; keep it unique among events. */
async function uniqueEventSlug(db: Db, base: string, ignoreId?: string) {
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const clash = await db.event.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!clash || clash.id === ignoreId) return slug;
    slug = `${base}-${++n}`;
  }
}

/**
 * Bring the form's event in line: create it, update it, or delete it when the
 * form stops being an event. Deleting the form itself needs no call here  the
 * foreign key cascades.
 */
export async function syncEventForForm(
  db: Db,
  form: FormSource,
  details: EventDetails | null,
): Promise<void> {
  const existing = await db.event.findUnique({
    where: { registrationFormId: form.id },
    select: { id: true },
  });

  if (!details) {
    if (existing) await db.event.delete({ where: { id: existing.id } });
    return;
  }

  const shared = {
    title: form.title,
    description: form.description ?? "",
    coverImage: form.coverImage,
    capacity: form.capacity,
    published: form.published,
    ...details,
  };

  if (existing) {
    await db.event.update({
      where: { id: existing.id },
      data: { ...shared, slug: await uniqueEventSlug(db, form.slug, existing.id) },
    });
    return;
  }

  await db.event.create({
    data: {
      ...shared,
      slug: await uniqueEventSlug(db, form.slug),
      registrationFormId: form.id,
    },
  });
}
