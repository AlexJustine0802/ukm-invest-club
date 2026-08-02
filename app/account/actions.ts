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

/** One row clicked. */
export async function markNotificationRead(key: string) {
  await markRead([key]);
}

/**
 * Every notification currently in the bell. The keys come from the server's own
 * list, not from the client, so a caller cannot write arbitrary rows.
 */
export async function markAllNotificationsRead() {
  const all = await getTopBarNotifications();
  await markRead(all.filter((n) => !n.read).map((n) => n.id));
}
