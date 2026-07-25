import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Users, MessagesSquare, Lock, LogOut } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import { getUiIcon } from "@/lib/uiIcons";
import { eventPalette } from "@/lib/eventStyles";
import { joinChannel, leaveChannel, createPost } from "../actions";

export const metadata: Metadata = { title: "Discussion" };
export const dynamic = "force-dynamic";

/** "just now" / "5m ago" / "3h ago" / "2d ago", then a plain date. */
function ago(date: Date, now: Date): string {
  const mins = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`;
  if (mins < 60 * 24 * 7) return `${Math.floor(mins / (60 * 24))}d ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  const { slug } = await params;
  const channel = await prisma.discussionChannel.findUnique({
    where: { slug },
    include: { _count: { select: { members: true, posts: true } } },
  });
  if (!channel || !channel.published) notFound();

  const membership = await prisma.channelMember.findUnique({
    where: { channelId_userId: { channelId: channel.id, userId: user.id } },
    select: { id: true },
  });

  const Icon = getUiIcon(channel.icon);
  const palette = eventPalette(channel.color, channel.name);
  const now = new Date();

  const backLink = (
    <Link
      href="/account/discussions"
      className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"
    >
      <ArrowLeft className="h-4 w-4" />
      Back to Discussions
    </Link>
  );

  // Not a member: show the join card and stop. No posts are fetched, so the
  // conversation never reaches the browser.
  if (!membership) {
    return (
      <>
        {backLink}
        <AccountTopBar
          title={channel.name}
          subtitle="Members only"
          showSearch={false}
          name={user.name}
          initial={user.name.charAt(0).toUpperCase()}
          role={user.role}
        />

        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <span
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${palette.badge}`}
          >
            <Icon className="h-7 w-7" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-navy">{channel.name}</h2>
            {channel.description && (
              <p className="mt-1 max-w-md text-sm text-slate-500">
                {channel.description}
              </p>
            )}
          </div>
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <Users className="h-4 w-4 text-slate-400" />
            {channel._count.members} member
            {channel._count.members === 1 ? "" : "s"}
          </p>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Lock className="h-4 w-4 text-slate-400" />
            Join this channel to read and post messages.
          </p>
          <form action={joinChannel}>
            <input type="hidden" name="channelId" value={channel.id} />
            <button
              type="submit"
              className="rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Join channel
            </button>
          </form>
        </div>
      </>
    );
  }

  const posts = await prisma.discussionPost.findMany({
    where: { channelId: channel.id },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  return (
    <>
      {backLink}
      <AccountTopBar
        title={channel.name}
        subtitle={channel.description ?? undefined}
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      {/* Channel bar */}
      <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${palette.badge}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              {channel._count.members} member
              {channel._count.members === 1 ? "" : "s"}
            </span>
            <span className="flex items-center gap-1.5">
              <MessagesSquare className="h-3.5 w-3.5 text-slate-400" />
              {posts.length} message{posts.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <form action={leaveChannel}>
          <input type="hidden" name="channelId" value={channel.id} />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-rose-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            Leave channel
          </button>
        </form>
      </div>

      {/* Feed */}
      <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <MessagesSquare className="h-9 w-9 text-slate-300" />
            <p className="font-semibold text-navy">No messages yet</p>
            <p className="text-sm text-slate-500">Start the conversation below.</p>
          </div>
        ) : (
          posts.map((p) => {
            const mine = p.user.id === user.id;
            const authorPalette = eventPalette(null, p.user.name);
            return (
              <article key={p.id} className="flex gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${authorPalette.badge}`}
                >
                  {p.user.name.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-sm font-semibold text-navy">
                      {p.user.name}
                      {mine && (
                        <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                          You
                        </span>
                      )}
                    </p>
                    <span className="text-xs text-slate-400">{p.user.role}</span>
                    <span className="text-xs text-slate-400">
                      · {ago(p.createdAt, now)}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">
                    {p.body}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Composer */}
      <form
        action={createPost}
        className="mt-4 rounded-2xl border border-slate-200 bg-white p-4"
      >
        <input type="hidden" name="channelId" value={channel.id} />
        <label htmlFor="body" className="sr-only">
          Message
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={3}
          maxLength={2000}
          placeholder={`Write a message in ${channel.name}...`}
          className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-primary"
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-400">Up to 2000 characters.</p>
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Post message
          </button>
        </div>
      </form>
    </>
  );
}
