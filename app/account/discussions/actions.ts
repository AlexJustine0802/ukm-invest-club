"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";

/** Longest a single message can be. Enforced here, not just on the textarea. */
const MAX_BODY = 2000;

function revalidateChannel(slug?: string | null) {
  revalidatePath("/account/discussions");
  if (slug) revalidatePath(`/account/discussions/${slug}`);
}

/**
 * Join a channel. The (channelId, userId) pair is unique, so a double click or
 * two tabs cannot create a duplicate membership.
 */
export async function joinChannel(formData: FormData) {
  const session = await getUserSession();
  if (!session) return;

  const channelId = formData.get("channelId") as string;
  if (!channelId) return;

  const channel = await prisma.discussionChannel.findUnique({
    where: { id: channelId },
    select: { slug: true, published: true },
  });
  if (!channel || !channel.published) return;

  await prisma.channelMember
    .create({ data: { channelId, userId: session.userId } })
    .catch(() => {
      // Unique constraint — already a member, nothing to do.
    });

  revalidateChannel(channel.slug);
}

export async function leaveChannel(formData: FormData) {
  const session = await getUserSession();
  if (!session) return;

  const channelId = formData.get("channelId") as string;
  if (!channelId) return;

  await prisma.channelMember.deleteMany({
    where: { channelId, userId: session.userId },
  });

  const channel = await prisma.discussionChannel.findUnique({
    where: { id: channelId },
    select: { slug: true },
  });
  revalidateChannel(channel?.slug);
}

/**
 * Post a message. Membership is re-checked here because the page-level gate is
 * only UI — this is the trust boundary. Someone who left in another tab and
 * resubmits an old form gets nothing written.
 */
export async function createPost(formData: FormData) {
  const session = await getUserSession();
  if (!session) return;

  const channelId = formData.get("channelId") as string;
  const body = ((formData.get("body") as string) ?? "").trim();
  if (!channelId || !body || body.length > MAX_BODY) return;

  const membership = await prisma.channelMember.findUnique({
    where: { channelId_userId: { channelId, userId: session.userId } },
    select: { id: true },
  });
  if (!membership) return;

  const channel = await prisma.discussionChannel.findUnique({
    where: { id: channelId },
    select: { slug: true, published: true },
  });
  if (!channel || !channel.published) return;

  await prisma.discussionPost.create({
    data: { channelId, userId: session.userId, body },
  });

  revalidateChannel(channel.slug);
}
