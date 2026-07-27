"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";

/**
 * Register the signed-in member for an event.
 *
 * Capacity is checked inside a transaction and the (eventId, userId) pair is
 * unique, so a double click or two tabs cannot oversell the event or create a
 * duplicate row.
 */
export async function registerForEvent(formData: FormData) {
  const session = await getUserSession();
  if (!session) return;

  const eventId = formData.get("eventId") as string;
  if (!eventId) return;

  await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: { id: eventId },
      select: { id: true, capacity: true, published: true },
    });
    if (!event || !event.published) return;

    if (event.capacity !== null) {
      const taken = await tx.eventRegistration.count({ where: { eventId } });
      if (taken >= event.capacity) return; // full
    }

    await tx.eventRegistration
      .create({ data: { eventId, userId: session.userId } })
      .catch(() => {
        // Unique constraint  already registered, nothing to do.
      });
  });

  revalidatePath("/account/events");
}

export async function cancelRegistration(formData: FormData) {
  const session = await getUserSession();
  if (!session) return;

  const eventId = formData.get("eventId") as string;
  if (!eventId) return;

  await prisma.eventRegistration.deleteMany({
    where: { eventId, userId: session.userId },
  });

  revalidatePath("/account/events");
}
