import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Bookmark, MapPin, Clock } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import { getSections } from "@/lib/dashboardContent";
import { getUiIcon } from "@/lib/uiIcons";
import { getMetricValues, resolveMetric } from "@/lib/metrics";
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

export default async function AccountPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
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
    mySubmissions,
  ] = await Promise.all([
    // Newest active highlight, managed from /admin/highlights.
    prisma.highlight.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
    // Editable blocks, managed from /admin/dashboard-content.
    getSections([
      "overview",
      "announcement",
      "resource",
    ]),
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
    // Live counts for any Overview card wired to a metric.
    getMetricValues(now),
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
      where: { published: true, status: "ACTIVE" },
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
    prisma.assignmentSubmission.findMany({
      where: { userId: session.userId },
      select: { assignmentId: true },
    }),
  ]);

  const submittedAssignmentIds = new Set(
    mySubmissions.map((s) => s.assignmentId),
  );

  const displayName = user.name;
  const firstName = displayName.split(" ")[0];
  const initial = displayName.charAt(0).toUpperCase();

  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const week = weekOf(now);
  const weekDays = new Set(week.map((w) => w.iso));
  const thisWeekEvents = events.filter((e) =>
    weekDays.has(e.eventDate.toDateString()),
  );

  const railAnnouncements = content.announcement.slice(0, 3);

  return (
    <>
      <AccountTopBar
        title={`${greeting}, ${firstName}! 👋`}
        subtitle={
          <span className="italic">
            &ldquo;The best investment you can make is in yourself.&rdquo; – Warren
            Buffett
          </span>
        }
        showSearch={false}
        name={displayName}
        initial={initial}
        role={user.role}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Center column */}
        <div className="space-y-6">
          {/* Highlight — managed in /admin/highlights */}
          {highlight && (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-primary-dark p-8 text-white">
              <div className="relative max-w-lg">
                <p className="text-sm font-semibold text-blue-200">
                  {highlight.eyebrow}
                </p>
                <h2 className="mt-2 text-3xl font-extrabold">{highlight.title}</h2>
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
                      {highlight.buttonLabel} <ChevronRight className="h-4 w-4" />
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
            </div>
          )}

          {/* Overview */}
          {content.overview.length > 0 && (
            <section>
              <h3 className="text-lg font-bold text-navy">Overview</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {content.overview.map((o) => {
                  const Icon = getUiIcon(o.icon);
                  // A card wired to a metric — explicitly, or guessed from its
                  // label — counts itself; otherwise the admin typed the value.
                  const metric = resolveMetric(o.metric, o.title);
                  const value = metric ? String(metrics[metric]) : o.subtitle;
                  return (
                    <div
                      key={o.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${o.color ?? "bg-blue-50 text-primary"}`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-2xl font-extrabold leading-tight text-navy">
                            {value}
                          </p>
                          <p className="text-sm text-slate-500">{o.title}</p>
                        </div>
                      </div>
                      {/* A typed "↑ 3 this week" cannot be trusted next to a
                          live count, so it only shows on manual cards. */}
                      {o.note && !metric && (
                        <p className="mt-3 text-xs font-semibold text-emerald-600">
                          {o.note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Two-column detail area */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left: resources + discussions */}
            <div className="space-y-6">
              {content.resource.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-bold text-navy">Recent Resources</h3>
                  <div className="mt-4 space-y-4">
                    {content.resource.map((r) => (
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
                            <p className="text-sm font-bold text-navy">{r.title}</p>
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
                    ))}
                  </div>
                </section>
              )}

              {/* Real channels, ordered by the most recent message. */}
              {channels.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-navy">Recent Discussions</h3>
                    <Link
                      href="/account/discussions"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="mt-4 space-y-4">
                    {channels.map((c) => {
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
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Right: events + calendar */}
            <div className="space-y-6">
              <section className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-navy">Upcoming Events</h3>
                  <Link
                    href="/account/events"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    View All
                  </Link>
                </div>
                <div className="mt-4 space-y-4">
                  {events.length === 0 ? (
                    <p className="text-sm text-slate-400">No upcoming events.</p>
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
                          <p className="text-sm font-bold text-navy">{e.title}</p>
                          <p className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock className="h-3 w-3" />
                            {e.eventDate.toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {e.location && (
                            <p className="flex items-center gap-1 text-xs text-slate-400">
                              <MapPin className="h-3 w-3" /> {e.location}
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
                <div className="mt-4 space-y-3">
                  {thisWeekEvents.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      Nothing scheduled this week.
                    </p>
                  ) : (
                    thisWeekEvents.map((e) => (
                      <div key={e.id} className="flex items-center gap-2 text-xs">
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
          </div>

          <p className="pt-2 text-center text-xs text-slate-400">
            © {now.getFullYear()} Investment Club Unpar. All rights reserved.
          </p>
        </div>

        {/* Right rail */}
        <div className="space-y-6">
          {railAnnouncements.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-navy">Announcements</h3>
                <Link
                  href="/account/announcements"
                  className="text-sm font-semibold text-primary"
                >
                  View All
                </Link>
              </div>
              <div className="mt-4 space-y-4">
                {railAnnouncements.map((a) => {
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
                })}
              </div>
            </section>
          )}

          {/* Real assignments — the same rows the Assignments page reads. */}
          {deadlines.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-navy">Assignment Deadlines</h3>
                <Link
                  href="/account/assignments"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="mt-4 space-y-4">
                {deadlines.map((d) => {
                  const Icon = getUiIcon(d.icon);
                  const soon = isDueSoon(d.dueDate, d.status, now);
                  const submitted = submittedAssignmentIds.has(d.id);
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
                            submitted
                              ? "text-emerald-600"
                              : soon
                                ? "text-rose-600"
                                : "text-slate-400"
                          }`}
                        >
                          {submitted ? "Submitted" : dueLabel(d.dueDate, now)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Straight from the Career Alerts admin — no second list to keep in sync. */}
          {careerAlerts.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-navy">Career Alert Highlights</h3>
                <Link
                  href="/account/career"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View All
                </Link>
              </div>
              <div className="mt-4 space-y-4">
                {careerAlerts.map((c) => {
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
                        <p className="truncate text-xs text-slate-500">{c.role}</p>
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
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
