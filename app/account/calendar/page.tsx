import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  MapPin,
  ClipboardList,
  CalendarCheck,
} from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import {
  eventPalette,
  timeRange,
  monthRange,
  monthParam,
  monthLabel,
} from "@/lib/eventStyles";
import { dueLabel, isDueSoon } from "@/lib/assignments";

export const metadata: Metadata = { title: "Calendar" };
export const dynamic = "force-dynamic";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string; d?: string; dir?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const { m, d, dir } = await searchParams;
  const { year, month, start, end } = monthRange(m);

  const [events, assignments, registrations] = await Promise.all([
    prisma.event.findMany({
      where: { published: true, eventDate: { gte: start, lt: end } },
      orderBy: { eventDate: "asc" },
      include: { category: true },
    }),
    prisma.assignment.findMany({
      // Handed in = off the calendar, both the grid chips and the day panel.
      where: {
        published: true,
        dueDate: { gte: start, lt: end },
        submissions: { none: { userId: user.id } },
      },
      orderBy: { dueDate: "asc" },
    }),
    prisma.eventRegistration.findMany({
      where: { userId: user.id, event: { eventDate: { gte: start, lt: end } } },
      orderBy: { event: { eventDate: "asc" } },
      include: { event: true },
    }),
  ]);

  const registeredIds = new Set(registrations.map((r) => r.eventId));

  // One item list per day-of-month. The chips in the grid and the expanded day
  // panel below it read the same list, so they can never disagree.
  interface DayItem {
    kind: "event" | "deadline";
    title: string;
    className: string;
    detail: string;
    location: string | null;
    registered: boolean;
    href: string;
  }

  const itemsByDay = new Map<number, DayItem[]>();
  const addItem = (date: Date, item: DayItem) => {
    const day = date.getDate();
    const list = itemsByDay.get(day) ?? [];
    list.push(item);
    itemsByDay.set(day, list);
  };

  for (const e of events) {
    addItem(e.eventDate, {
      kind: "event",
      title: e.title,
      className: eventPalette(e.category?.color, e.category?.title ?? e.title)
        .badge,
      detail: timeRange(e.eventDate, e.endDate),
      location: e.location,
      registered: registeredIds.has(e.id),
      href: "/account/events",
    });
  }
  for (const a of assignments) {
    addItem(a.dueDate, {
      kind: "deadline",
      title: a.title,
      className: "bg-amber-50 text-amber-700",
      detail: `${a.category} · ${dueLabel(a.dueDate, new Date())}`,
      location: null,
      registered: false,
      href: "/account/assignments",
    });
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = start.getDay();
  const now = new Date();
  const isThisMonth =
    now.getFullYear() === year && now.getMonth() === month;

  // ?d=<day> expands that day below the grid; clicking it again collapses it.
  const parsedDay = Number(d);
  const selectedDay =
    Number.isInteger(parsedDay) && parsedDay >= 1 && parsedDay <= daysInMonth
      ? parsedDay
      : null;
  const thisMonthParam = monthParam(year, month);
  const dayHref = (day: number) =>
    day === selectedDay
      ? `/account/calendar?m=${thisMonthParam}`
      : `/account/calendar?m=${thisMonthParam}&d=${day}#day-detail`;
  const selectedItems = selectedDay ? (itemsByDay.get(selectedDay) ?? []) : [];

  const cardClass = "rounded-2xl border border-slate-200 bg-white p-5";

  // ?dir set only by the prev/next arrows, so the grid slides in from the side
  // you came from. Today / a direct link / a day click just render still.
  const slideClass =
    dir === "n"
      ? "animate-slide-in-right"
      : dir === "p"
        ? "animate-slide-in-left"
        : "";

  return (
    <>
      <AccountTopBar
        title="Calendar"
        subtitle="Everything happening this month, in one place."
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Month grid */}
        {/* min-w-0 so the grid track shrinks to the column instead of to the
            month grid's min-content. */}
        <div className={`${cardClass} min-w-0 lg:col-span-2`}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="min-w-0 truncate text-lg font-bold text-navy">
              {monthLabel(year, month)}
            </h2>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href={`/account/calendar?m=${monthParam(year, month, -1)}&dir=p`}
                aria-label="Previous month"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <Link
                href="/account/calendar"
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Today
              </Link>
              <Link
                href={`/account/calendar?m=${monthParam(year, month, 1)}&dir=n`}
                aria-label="Next month"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* overflow-hidden so the slide never widens the page. The key remounts
              the grid on a month change, which is what replays the animation. */}
          <div className="overflow-hidden">
          <div
            key={thisMonthParam}
            className={`${slideClass} motion-reduce:animate-none`}
          >
          <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
            {WEEKDAYS.map((d) => (
              <div key={d} className="pb-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-14 rounded-lg sm:min-h-24" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const chips = itemsByDay.get(day) ?? [];
              const isToday = isThisMonth && now.getDate() === day;
              const isSelected = day === selectedDay;
              return (
                <Link
                  key={day}
                  href={dayHref(day)}
                  scroll={false}
                  aria-current={isSelected ? "date" : undefined}
                  className={`block min-h-14 rounded-lg border p-1 text-left transition-colors hover:border-primary/60 hover:bg-blue-50/40 sm:min-h-24 sm:p-1.5 ${
                    isSelected
                      ? "border-primary bg-blue-50 ring-2 ring-primary/30"
                      : isToday
                        ? "border-primary bg-blue-50/40"
                        : "border-slate-100 bg-white"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      isToday || isSelected ? "text-primary" : "text-slate-500"
                    }`}
                  >
                    {day}
                  </span>
                  {/* Labels need room; on phones the day just shows dots. */}
                  <div className="mt-1 hidden space-y-1 sm:block">
                    {chips.slice(0, 2).map((c, idx) => (
                      <p
                        key={idx}
                        title={c.title}
                        className={`truncate rounded px-1.5 py-0.5 text-[10px] font-semibold ${c.className}`}
                      >
                        {c.title}
                      </p>
                    ))}
                    {chips.length > 2 && (
                      <p className="px-1.5 text-[10px] font-semibold text-slate-400">
                        +{chips.length - 2} more
                      </p>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                    {chips.slice(0, 3).map((c, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 w-1.5 rounded-full ${
                          c.kind === "event" ? "bg-primary" : "bg-amber-500"
                        }`}
                      />
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
          </div>
          </div>

          {/* Expanded day */}
          {selectedDay !== null && (
            <div
              id="day-detail"
              className="mt-5 scroll-mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-navy">
                  {new Date(year, month, selectedDay).toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <Link
                  href={`/account/calendar?m=${thisMonthParam}`}
                  scroll={false}
                  aria-label="Close day details"
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  ✕ Close
                </Link>
              </div>

              {selectedItems.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  Nothing scheduled on this day.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {selectedItems.map((item, idx) => (
                    <li key={idx}>
                      <Link
                        href={item.href}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 hover:border-primary/50"
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.className}`}
                        >
                          {item.kind === "event" ? (
                            <CalendarDays className="h-4 w-4" />
                          ) : (
                            <ClipboardList className="h-4 w-4" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-navy">{item.title}</p>
                            {item.registered && (
                              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                <CalendarCheck className="h-3 w-3" />
                                Registered
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {item.detail}
                          </p>
                          {item.location && (
                            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {item.location}
                            </p>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Reminders */}
        <div className="min-w-0 space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Events */}
          <section className={cardClass}>
            <h3 className="flex items-center gap-2 font-bold text-navy">
              <CalendarDays className="h-4 w-4 text-primary" />
              Events this month
            </h3>
            {events.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                Nothing scheduled this month.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {events.map((e) => {
                  const palette = eventPalette(
                    e.category?.color,
                    e.category?.title ?? e.title,
                  );
                  return (
                    <li key={e.id} className="flex gap-3">
                      <span
                        className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg text-[11px] font-bold leading-none ${palette.badge}`}
                      >
                        <span className="text-sm">{e.eventDate.getDate()}</span>
                        <span className="mt-0.5 font-semibold uppercase">
                          {e.eventDate.toLocaleDateString("en-GB", {
                            month: "short",
                          })}
                        </span>
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-navy">
                          {e.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {timeRange(e.eventDate, e.endDate)}
                        </p>
                        {e.location && (
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {e.location}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              href="/account/events"
              className="mt-4 inline-block text-xs font-semibold text-primary hover:underline"
            >
              View all events →
            </Link>
          </section>

          {/* Deadlines */}
          <section className={cardClass}>
            <h3 className="flex items-center gap-2 font-bold text-navy">
              <ClipboardList className="h-4 w-4 text-amber-600" />
              Deadlines
            </h3>
            {assignments.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                No assignments due this month.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {assignments.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy">
                        {a.title}
                      </p>
                      <p className="text-xs text-slate-500">{a.category}</p>
                      <p
                        className={`mt-0.5 text-xs font-semibold ${
                          isDueSoon(a.dueDate, a.status, now)
                            ? "text-rose-600"
                            : "text-slate-400"
                        }`}
                      >
                        {dueLabel(a.dueDate, now)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/account/assignments"
              className="mt-4 inline-block text-xs font-semibold text-primary hover:underline"
            >
              View all assignments →
            </Link>
          </section>

          {/* My registrations */}
          <section className={cardClass}>
            <h3 className="flex items-center gap-2 font-bold text-navy">
              <CalendarCheck className="h-4 w-4 text-emerald-600" />
              My registrations
            </h3>
            {registrations.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                You have not registered for anything this month.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {registrations.map((r) => (
                  <li key={r.id} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy">
                        {r.event.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.event.eventDate.toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                        })}{" "}
                        · {timeRange(r.event.eventDate, r.event.endDate)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/account/events?tab=registration"
              className="mt-4 inline-block text-xs font-semibold text-primary hover:underline"
            >
              View my registrations →
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
