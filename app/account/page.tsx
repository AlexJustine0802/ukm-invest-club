import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Bookmark, MapPin, Clock } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import EmptyState from "@/components/EmptyState";
import LatestUpdates from "@/components/account/LatestUpdates";
import Reveal from "@/components/Reveal";
import { getSections } from "@/lib/dashboardContent";
import { getAnnouncements } from "@/lib/announcements";
import { getUiIcon } from "@/lib/uiIcons";
import { getMetricValues, resolveMetric } from "@/lib/metrics";
import { greetingFor } from "@/lib/greeting";
import Greeting from "@/components/account/Greeting";
import { eventPalette } from "@/lib/eventStyles";
import { dueLabel, isDueSoon } from "@/lib/assignments";
import { isNewAlert } from "@/lib/career";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

/** Monday-to-Sunday strip for the week containing `today`. */
function weekOf(today: Date) {
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      day: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      date: String(d.getDate()),
      active: d.toDateString() === today.toDateString(),
      iso: d.toDateString(),
    };
  });
}

/**
 * Every list card keeps this body height whether it has rows or not, so an
 * empty database renders the same layout as a full one  no collapsing, no
 * shifting.
 */
const LIST_BODY = "mt-4 min-h-[180px] space-y-4";
const RAIL_BODY = "mt-4 min-h-[150px] space-y-4";

/**
 * Shown when nobody has configured Overview cards yet. The values still come
 * from the live counters, so an empty database simply reads 0.
 */
const DEFAULT_OVERVIEW = [
  {
    id: "default-resources",
    title: "Resources Available",
    icon: "BookOpen",
    color: "bg-blue-50 text-primary",
    metric: "resources" as const,
  },
  {
    id: "default-events",
    title: "Upcoming Events",
    icon: "CalendarDays",
    color: "bg-emerald-50 text-emerald-600",
    metric: "upcoming-events" as const,
  },
  {
    id: "default-assignments",
    title: "Pending Assignments",
    icon: "ClipboardList",
    color: "bg-violet-50 text-violet-600",
    metric: "pending-assignments" as const,
  },
  {
    id: "default-career",
    title: "Career Alerts",
    icon: "Briefcase",
    color: "bg-amber-50 text-amber-600",
    metric: "career-alerts" as const,
  },
];

export default async function AccountPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const now = new Date();

  const [
    highlight,
    content,
    events,
    metrics,
    careerAlerts,
    deadlines,
    channels,
    announcements,
  ] = await Promise.all([
    // Newest active highlight, managed from /admin/highlights.
    prisma.highlight.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
    // Editable blocks, managed from /admin/dashboard-content.
    getSections(["overview", "resource"]),
    // Upcoming events reuse the existing public Event model.
    prisma.event.findMany({
      where: { published: true, eventDate: { gte: now } },
      orderBy: { eventDate: "asc" },
      take: 4,
      select: {
        id: true,
        slug: true,
        title: true,
        eventDate: true,
        location: true,
      },
    }),
    // Live counts for any Overview card wired to a metric. "Pending
    // assignments" is this member's own outstanding work.
    getMetricValues(now, user.id),
    // The dashboard rails below read the real tables, not a second hand-typed
    // copy in Dashboard Content.
    prisma.careerAlert.findMany({
      where: {
        published: true,
        OR: [{ deadline: null }, { deadline: { gte: now } }],
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.assignment.findMany({
      // Already handed in = no longer a deadline for this member.
      where: {
        published: true,
        status: "ACTIVE",
        submissions: { none: { userId: session.userId } },
      },
      orderBy: { dueDate: "asc" },
      take: 3,
    }),
    prisma.discussionChannel.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 3,
      include: {
        _count: { select: { posts: true, members: true } },
        posts: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { user: { select: { name: true } } },
        },
      },
    }),
    // Hand-written notices plus anything switched on in /admin/announcements.
    getAnnouncements(),
  ]);

  const displayName = user.name;
  const firstName = displayName.split(" ")[0];
  const initial = displayName.charAt(0).toUpperCase();

  // Starting value only; Greeting switches to the reader's own clock.
  const greeting = greetingFor(now);

  const week = weekOf(now);
  const weekDays = new Set(week.map((w) => w.iso));
  const thisWeekEvents = events.filter((e) =>
    weekDays.has(e.eventDate.toDateString()),
  );

  const railAnnouncements = announcements.slice(0, 3);

  // Stat cards always render. Admin-configured rows win; with none configured
  // the defaults above stand in so the row of cards never disappears.
  const overviewCards = (
    content.overview.length > 0
      ? content.overview.map((o) => {
          const metric = resolveMetric(o.metric, o.title);
          return {
            id: o.id,
            title: o.title,
            icon: o.icon,
            color: o.color,
            value: metric ? String(metrics[metric]) : (o.subtitle ?? "0"),
            // A typed "↑ 3 this week" cannot be trusted next to a live count.
            note: metric ? null : o.note,
          };
        })
      : DEFAULT_OVERVIEW.map((d) => ({
          ...d,
          value: String(metrics[d.metric]),
          note: null,
        }))
  ).slice(0, 4);

  // Mobile-only summary bar. Reuses the data already fetched above for the
  // side rails  no extra queries, no second copy of the widgets.
  const latestUpdates = [
    {
      id: "announcements",
      label: "Announcements",
      count: announcements.length,
      href: "/account/announcements",
      icon: "Megaphone",
      color: "bg-blue-50 text-primary",
    },
    {
      id: "deadlines",
      label: "Assignment Deadlines",
      count: deadlines.length,
      href: "/account/assignments",
      icon: "ClipboardList",
      color: "bg-violet-50 text-violet-600",
    },
    {
      id: "career",
      label: "Career Alerts",
      count: careerAlerts.length,
      href: "/account/career",
      icon: "Briefcase",
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <>
      <LatestUpdates items={latestUpdates} />

      <AccountTopBar
        title={<Greeting name={firstName} initial={greeting} />}
        subtitle={
          <span className="italic">
            &ldquo;The best investment you can make is in yourself.&rdquo; –
            Warren Buffett
          </span>
        }
        showSearch={false}
        name={displayName}
        initial={initial}
        role={user.role}
      />

      {/* Fixed shell: the rail keeps its 340px whether or not it has content. */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Center column. min-w-0 because a grid item defaults to
            min-width:auto, which sizes the track to the widest card's
            min-content and pushes the whole column past the viewport. */}
        <div className="min-w-0 space-y-6">
          {/* Highlight  managed in /admin/highlights. Always rendered at a
              fixed height; with no active highlight it shows a placeholder. */}
          <Reveal className="relative flex min-h-[216px] flex-col justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-primary-dark p-6 text-white sm:p-8">
            {highlight ? (
              <>
                <div className="relative max-w-lg">
                  <p className="text-sm font-semibold text-blue-200">
                    {highlight.eyebrow}
                  </p>
                  <h2 className="mt-2 break-words text-3xl font-extrabold">
                    {highlight.title}
                  </h2>
                  {highlight.description && (
                    <p className="mt-2 text-sm text-blue-100">
                      {highlight.description}
                    </p>
                  )}
                  {highlight.buttonLabel && (
                    <div className="mt-6">
                      <Link
                        href={highlight.buttonHref || "#"}
                        className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary"
                      >
                        {highlight.buttonLabel}{" "}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </div>
                {highlight.noteTitle && (
                  <div className="absolute bottom-8 right-8 hidden w-56 rounded-xl bg-white/10 p-4 backdrop-blur xl:block">
                    <p className="text-sm font-bold">{highlight.noteTitle}</p>
                    {highlight.noteBody && (
                      <p className="mt-1 text-xs text-blue-100">
                        {highlight.noteBody}
                      </p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="relative max-w-lg">
                <p className="text-sm font-semibold text-blue-200">
                  Welcome back
                </p>
                <h2 className="mt-2 break-words text-3xl font-extrabold">
                  Investment Club Unpar
                </h2>
                <p className="mt-2 text-sm text-blue-100">
                  No featured announcement available.
                </p>
              </div>
            )}
          </Reveal>

          {/* Overview  the stat row is always present, showing 0 when empty. */}
          <Reveal as="section">
            <h3 className="text-lg font-bold text-navy">Overview</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {overviewCards.map((o) => {
                const Icon = getUiIcon(o.icon);
                return (
                  <div
                    key={o.id}
                    className="flex min-h-[104px] flex-col justify-center rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${o.color ?? "bg-blue-50 text-primary"}`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-2xl font-extrabold leading-tight text-navy">
                          {o.value}
                        </p>
                        <p className="text-sm text-slate-500">{o.title}</p>
                      </div>
                    </div>
                    {o.note && (
                      <p className="mt-3 text-xs font-semibold text-emerald-600">
                        {o.note}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* Detail area  both columns always exist. */}
          <Reveal className="grid gap-6 lg:grid-cols-2">
            {/* Left: resources + discussions */}
            <div className="min-w-0 space-y-6">
              <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-bold text-navy">Recent Resources</h3>
                <div className={`flex flex-col ${LIST_BODY}`}>
                  {content.resource.length === 0 ? (
                    <EmptyState message="No resources available." />
                  ) : (
                    content.resource.map((r) => (
                      <Link
                        key={r.id}
                        href={r.href || "/account/resources"}
                        className="flex items-center gap-3"
                      >
                        <span
                          className={`h-12 w-16 shrink-0 rounded-lg ${r.color ?? "bg-slate-700"}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-navy">
                              {r.title}
                            </p>
                            {r.badge && (
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                {r.badge}
                              </span>
                            )}
                          </div>
                          {r.subtitle && (
                            <p className="truncate text-xs text-slate-400">
                              {r.subtitle}
                            </p>
                          )}
                        </div>
                        {r.note && (
                          <span className="shrink-0 text-xs text-slate-400">
                            {r.note}
                          </span>
                        )}
                        <Bookmark className="h-4 w-4 shrink-0 text-slate-300" />
                      </Link>
                    ))
                  )}
                </div>
              </section>

              {/* Real channels, ordered by the most recent message. */}
              <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-navy">Recent Discussions</h3>
                  <Link
                    href="/account/discussions"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className={`flex flex-col ${LIST_BODY}`}>
                  {channels.length === 0 ? (
                    <EmptyState message="No discussions yet." />
                  ) : (
                    channels.map((c) => {
                      const ChannelIcon = getUiIcon(c.icon ?? "MessageSquare");
                      const palette = eventPalette(c.color, c.name);
                      const last = c.posts[0];
                      return (
                        <Link
                          key={c.id}
                          href={`/account/discussions/${c.slug}`}
                          className="-m-1 flex items-start gap-3 rounded-lg p-1 hover:bg-slate-50"
                        >
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${palette.badge}`}
                          >
                            <ChannelIcon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-navy">
                              {c.name}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              {c._count.posts} message
                              {c._count.posts === 1 ? "" : "s"} ·{" "}
                              {c._count.members} member
                              {c._count.members === 1 ? "" : "s"}
                            </p>
                            {last && (
                              <p className="truncate text-xs text-slate-500">
                                {last.user.name}: {last.body}
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </section>
            </div>

            {/* Right: events + calendar. Stacked on mobile this column comes
                first, so the order there reads Upcoming Events → Calendar →
                Recent Resources. Two columns from lg, where source order wins
                again and the desktop layout is unchanged. */}
            <div className="order-first min-w-0 space-y-6 lg:order-none">
              <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-navy">Upcoming Events</h3>
                  <Link
                    href="/account/events"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className={`flex flex-col ${LIST_BODY}`}>
                  {events.length === 0 ? (
                    <EmptyState message="No upcoming events yet." />
                  ) : (
                    events.map((e) => (
                      <div key={e.id} className="flex items-center gap-3">
                        <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-50">
                          <span className="text-lg font-extrabold leading-none text-navy">
                            {e.eventDate.getDate()}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            {e.eventDate.toLocaleDateString("en-US", {
                              month: "short",
                            })}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-bold text-navy">
                            {e.title}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="h-3 w-3 shrink-0" />
                            {e.eventDate.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {e.location && (
                            <p className="flex items-center gap-1 text-xs text-slate-400">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{e.location}</span>
                            </p>
                          )}
                        </div>
                        <Link
                          href="/account/events"
                          className="shrink-0 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-primary"
                        >
                          Details
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-navy">Calendar Preview</h3>
                  <Link
                    href="/account/calendar"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    View Calendar
                  </Link>
                </div>
                <div className="mt-4 grid grid-cols-7 gap-1">
                  {week.map((w) => (
                    <div
                      key={w.iso}
                      className={`flex flex-col items-center rounded-lg py-2 ${
                        w.active ? "bg-primary text-white" : "text-slate-500"
                      }`}
                    >
                      <span className="text-[10px] font-semibold uppercase">
                        {w.day}
                      </span>
                      <span className="text-sm font-bold">{w.date}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex min-h-[96px] flex-col space-y-3">
                  {thisWeekEvents.length === 0 ? (
                    <EmptyState message="No scheduled events this week." />
                  ) : (
                    thisWeekEvents.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span className="shrink-0 text-slate-400">
                          {e.eventDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                        <span className="min-w-0 flex-1 truncate font-medium text-navy">
                          {e.title}
                        </span>
                        {e.eventDate.toDateString() === now.toDateString() && (
                          <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            Today
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </Reveal>

          <p className="pt-2 text-center text-xs text-slate-400">
            © {now.getFullYear()} Investment Club Unpar. All rights reserved.
          </p>
        </div>

        {/* Right rail. Hidden on mobile  the Latest Updates bar at the top of
            the page surfaces these same three widgets there, so showing them
            again at the bottom was a duplicate. Tablet and desktop unchanged. */}
        <Reveal className="hidden min-w-0 space-y-6 md:block">
          <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-navy">Announcements</h3>
              <Link
                href="/account/announcements"
                className="text-sm font-semibold text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className={`flex flex-col ${RAIL_BODY}`}>
              {railAnnouncements.length === 0 ? (
                <EmptyState message="No announcements yet." />
              ) : (
                railAnnouncements.map((a) => {
                  const Icon = getUiIcon(a.icon);
                  return (
                    <div key={a.id} className="flex gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.color ?? "bg-blue-50 text-primary"}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-navy">{a.title}</p>
                        {a.subtitle && (
                          <p className="text-xs text-slate-500">{a.subtitle}</p>
                        )}
                        {a.meta && (
                          <p className="text-xs text-slate-400">{a.meta}</p>
                        )}
                      </div>
                      {a.note && (
                        <span className="shrink-0 text-[11px] text-slate-400">
                          {a.note}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Real assignments  the same rows the Assignments page reads. */}
          <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-navy">Assignment Deadlines</h3>
              <Link
                href="/account/assignments"
                className="text-sm font-semibold text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className={`flex flex-col ${RAIL_BODY}`}>
              {deadlines.length === 0 ? (
                <EmptyState message="No assignments due." />
              ) : (
                deadlines.map((d) => {
                  const Icon = getUiIcon(d.icon);
                  const soon = isDueSoon(d.dueDate, d.status, now);
                  return (
                    <Link
                      key={d.id}
                      href={`/account/assignments/${d.id}`}
                      className="-m-1 flex gap-3 rounded-lg p-1 hover:bg-slate-50"
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${d.color ?? "bg-amber-50 text-amber-600"}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-navy">
                          {d.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {d.category} • {d.workType}
                        </p>
                        <p
                          className={`text-xs font-semibold ${
                            soon ? "text-rose-600" : "text-slate-400"
                          }`}
                        >
                          {dueLabel(d.dueDate, now)}
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </section>

          {/* Straight from the Career Alerts admin  no second list to keep in sync. */}
          <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-navy">Career Alert Highlights</h3>
              <Link
                href="/account/career"
                className="text-sm font-semibold text-primary hover:underline"
              >
                View All
              </Link>
            </div>
            <div className={`flex flex-col ${RAIL_BODY}`}>
              {careerAlerts.length === 0 ? (
                <EmptyState message="No career alerts yet." />
              ) : (
                careerAlerts.map((c) => {
                  const palette = eventPalette(c.color, c.company);
                  return (
                    <Link
                      key={c.id}
                      href="/account/career"
                      className="flex items-center gap-3 rounded-lg p-1 -m-1 hover:bg-slate-50"
                    >
                      <span
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg px-1 text-center text-sm font-bold leading-tight ${palette.badge}`}
                      >
                        {c.company
                          .split(/\s+/)
                          .slice(0, 2)
                          .map((word) => word.charAt(0).toUpperCase())
                          .join("")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-navy">
                          {c.company}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {c.role}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {[c.location, c.workType].filter(Boolean).join(" • ")}
                        </p>
                      </div>
                      {isNewAlert(c.createdAt, now) && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          New
                        </span>
                      )}
                    </Link>
                  );
                })
              )}
            </div>
          </section>
        </Reveal>
      </div>
    </>
  );
}
