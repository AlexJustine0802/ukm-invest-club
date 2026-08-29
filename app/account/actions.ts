"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  clearUserSessionCookie,
  getUserSession,
  verifyPassword,
} from "@/lib/userAuth";
import { getTopBarNotifications } from "@/lib/notifications";
import { getAnnouncements } from "@/lib/announcements";
import { assignmentKey } from "@/lib/assignments";

export type SettingsActionState = {
  error?: string;
  saved?: boolean;
};

export async function logoutUser() {
  await clearUserSessionCookie();
  redirect("/login");
}

function checked(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

export async function updateUserPreferences(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await getUserSession();
  if (!session) return { error: "Your session has expired. Please log in again." };

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      notifyAnnouncements: checked(formData, "notifyAnnouncements"),
      notifyEvents: checked(formData, "notifyEvents"),
      notifyAssignments: checked(formData, "notifyAssignments"),
      notifyCareer: checked(formData, "notifyCareer"),
      showPhoto: checked(formData, "showPhoto"),
      showSocials: checked(formData, "showSocials"),
    },
  });

  revalidatePath("/account/settings");
  revalidatePath("/account", "layout");
  revalidatePath("/account/members");
  revalidatePath("/about");
  return { saved: true };
}

export async function deleteMyAccount(
  _previousState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const session = await getUserSession();
  if (!session) return { error: "Your session has expired. Please log in again." };

  const password = String(formData.get("currentPassword") ?? "");
  if (!password) return { error: "Enter your current password to continue." };

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { passwordHash: true },
  });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "The password is incorrect." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.authToken.deleteMany({ where: { userId: session.userId } });
    await tx.notificationRead.deleteMany({ where: { userId: session.userId } });
    await tx.eventRegistration.deleteMany({ where: { userId: session.userId } });
    await tx.channelMember.deleteMany({ where: { userId: session.userId } });
    await tx.discussionPost.deleteMany({ where: { userId: session.userId } });
    await tx.assignmentSubmission.deleteMany({ where: { userId: session.userId } });
    await tx.formResponse.deleteMany({ where: { userId: session.userId } });
    await tx.user.delete({ where: { id: session.userId } });
  });

  await clearUserSessionCookie();
  redirect("/login?deleted=1");
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
 * Mark specific notifications read  one clicked row, or everything a tab just
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

/** Mark an item from one of the mobile update lists as read. */
export async function markUpdateRead(key: string) {
  const session = await getUserSession();
  if (!session || !key) return;

  const [notifications, announcements, assignments, careerAlerts] =
    await Promise.all([
      getTopBarNotifications(),
      getAnnouncements(),
      prisma.assignment.findMany({
        where: { published: true },
        select: { id: true },
      }),
      prisma.careerAlert.findMany({
        where: { published: true },
        select: { id: true },
      }),
    ]);

  const allowed = new Set([
    ...notifications.map((n) => n.id),
    ...announcements.map((a) => a.id),
    ...assignments.map((a) => assignmentKey(a.id)),
    ...careerAlerts.map((a) => `career-${a.id}`),
  ]);

  if (allowed.has(key)) await markRead([key]);
}

/**
 * Every notification currently in the bell. The keys come from the server's own
 * list, not from the client, so a caller cannot write arbitrary rows.
 */
export async function markAllNotificationsRead() {
  const all = await getTopBarNotifications();
  await markRead(all.filter((n) => !n.read).map((n) => n.id));
}
