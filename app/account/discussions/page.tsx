import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MessagesSquare, Users, SearchX, LogOut } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import InlineSearch from "@/components/account/InlineSearch";
import { getUiIcon } from "@/lib/uiIcons";
import { eventPalette } from "@/lib/eventStyles";
import { joinChannel, leaveChannel } from "./actions";

export const metadata: Metadata = { title: "Discussions" };
export const dynamic = "force-dynamic";

export default async function DiscussionsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  const { tab: tabParam, q = "" } = await searchParams;
  const tab = tabParam === "mine" ? "mine" : "all";
  const query = q.trim().toLowerCase();

  const [channels, myMemberships] = await Promise.all([
    prisma.discussionChannel.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      include: { _count: { select: { members: true, posts: true } } },
    }),
    prisma.channelMember.findMany({
      where: { userId: user.id },
      select: { channelId: true },
    }),
  ]);

  const joinedIds = new Set(myMemberships.map((m) => m.channelId));

  const matches = (c: (typeof channels)[number]) =>
    !query ||
    c.name.toLowerCase().includes(query) ||
    (c.description ?? "").toLowerCase().includes(query);

  const visible =
    tab === "mine"
      ? channels.filter((c) => joinedIds.has(c.id) && matches(c))
      : channels.filter(matches);

  const hrefWith = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    if (tab !== "all") params.set("tab", tab);
    if (query) params.set("q", q.trim());
    for (const [key, value] of Object.entries(patch)) params.set(key, value);
    if (params.get("tab") === "all") params.delete("tab");
    const qs = params.toString();
    return qs ? `/account/discussions?${qs}` : "/account/discussions";
  };

  return (
    <>
      <AccountTopBar
        title="Discussions"
        subtitle="Join a channel to read the conversation and post your own questions."
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap items-center gap-6 border-b border-slate-200">
        {[
          { id: "all", label: "All Channels" },
          { id: "mine", label: "My Channels" },
        ].map((t) => (
          <Link
            key={t.id}
            href={hrefWith({ tab: t.id })}
            className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold ${
              t.id === tab
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-navy"
            }`}
          >
            {t.label}
            {t.id === "mine" && joinedIds.size > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                {joinedIds.size}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end">
        <InlineSearch placeholder="Search channels..." />
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16">
          <SearchX className="h-10 w-10 text-slate-300" />
          <p className="font-semibold text-navy">
            {tab === "mine" ? "You haven't joined a channel yet" : "No channels found"}
          </p>
          <p className="text-sm text-slate-500">
            {tab === "mine"
              ? "Join a channel from All Channels and it will show up here."
              : "Try another search term, or check back later."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {visible.map((c) => {
            const Icon = getUiIcon(c.icon);
            const palette = eventPalette(c.color, c.name);
            const joined = joinedIds.has(c.id);

            return (
              <article
                key={c.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${palette.badge}`}
                >
                  <Icon className="h-6 w-6" />
                </span>

                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-navy">{c.name}</h2>
                  {c.description && (
                    <p className="mt-1 text-sm text-slate-500">{c.description}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      {c._count.members} member
                      {c._count.members === 1 ? "" : "s"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MessagesSquare className="h-3.5 w-3.5 text-slate-400" />
                      {c._count.posts} message
                      {c._count.posts === 1 ? "" : "s"}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 sm:w-44 sm:flex-col sm:items-stretch">
                  {joined ? (
                    <>
                      <Link
                        href={`/account/discussions/${c.slug}`}
                        className="flex-1 rounded-lg bg-primary px-6 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-dark"
                      >
                        Open
                      </Link>
                      <form action={leaveChannel}>
                        <input type="hidden" name="channelId" value={c.id} />
                        <button
                          type="submit"
                          className="flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-rose-600"
                        >
                          <LogOut className="h-3.5 w-3.5" />
                          Leave
                        </button>
                      </form>
                    </>
                  ) : (
                    <form action={joinChannel} className="flex-1">
                      <input type="hidden" name="channelId" value={c.id} />
                      <button
                        type="submit"
                        className="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
                      >
                        Join
                      </button>
                    </form>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
