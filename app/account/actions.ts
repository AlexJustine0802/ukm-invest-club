"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { clearUserSessionCookie, getUserSession } from "@/lib/userAuth";
import { getTopBarNotifications } from "@/lib/notifications";

export async function logoutUser() {
  await clearUserSessionCookie();
  redirect("/login");
}

/**
 * Mark notifications read for the signed-in member.
 *
 * `createMany` with `skipDuplicates` rather than an upsert loop: clicking a row
 * that is already read is a no-op instead of an error, and "mark all" is one
 * round trip. The unique index on (userId, key) is what makes that safe.
 */
async function markRead(keys: string[]) {
  const session = await getUserSession();
  if (!session || keys.length === 0) return;

  await prisma.notificationRead.createMany({
    data: keys.map((key) => ({ userId: session.userId, key })),
    skipDuplicates: true,
  });

  // The bell renders in the shell above every member page.
  revalidatePath("/account", "layout");
}

/**
 * Mark specific notifications read — one clicked row, or everything a tab just
 * showed the member.
 *
 * The keys are intersected with the member's own current notifications: a
 * server action is a public endpoint, so what arrives from the client decides
 * *which* of their notifications to mark, never what a notification is.
 */
export async function markNotificationsRead(keys: string[]) {
  if (keys.length === 0) return;
  const mine = new Set((await getTopBarNotifications()).map((n) => n.id));
  await markRead(keys.filter((k) => mine.has(k)));
}

/** One row clicked. */
export async function markNotificationRead(key: string) {
  await markNotificationsRead([key]);
}

/**
 * Every notification currently in the bell. The keys come from the server's own
 * list, not from the client, so a caller cannot write arbitrary rows.
 */
export async function markAllNotificationsRead() {
  const all = await getTopBarNotifications();
  await markRead(all.filter((n) => !n.read).map((n) => n.id));
}
