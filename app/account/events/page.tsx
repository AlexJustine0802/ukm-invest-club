import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarDays,
  Clock,
  MapPin,
  LayoutGrid,
  History,
  CalendarCheck,
  SearchX,
  Check,
  ArrowDownUp,
} from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import InlineSearch from "@/components/account/InlineSearch";
import { eventPalette, timeRange, eventDateLabel } from "@/lib/eventStyles";
import { formStatus } from "@/lib/forms";

export const metadata: Metadata = { title: "Events" };
export const dynamic = "force-dynamic";

const filters = [
  { id: "all", label: "All Event", icon: LayoutGrid },
  { id: "upcoming", label: "Upcoming", icon: CalendarDays },
  { id: "past", label: "Past Event", icon: History },
] as const;

type FilterId = (typeof filters)[number]["id"];

const sorts = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
] as const;

type SortId = (typeof sorts)[number]["id"];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    filter?: string;
    q?: string;
    sort?: string;
  }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const {
    tab: tabParam,
    filter: filterParam,
    q = "",
    sort: sortParam,
  } = await searchParams;
  const tab = tabParam === "registration" ? "registration" : "event";
  const filter: FilterId = filters.some((f) => f.id === filterParam)
    ? (filterParam as FilterId)
    : "all";
  const sort: SortId = sorts.some((s) => s.id === sortParam)
    ? (sortParam as SortId)
    : "oldest";
  const query = q.trim().toLowerCase();

  const now = new Date();

  const [events, myRegistrations] = await Promise.all([
    prisma.event.findMany({
      where: { published: true },
      orderBy: { eventDate: sort === "newest" ? "desc" : "asc" },
      include: {
        category: true,
        _count: { select: { registrations: true } },
        registrationForm: {
          select: {
            slug: true,
            published: true,
            registrationEnabled: true,
            opensAt: true,
            closesAt: true,
          },
        },
      },
    }),
    prisma.eventRegistration.findMany({
      where: { userId: user.id },
      select: { eventId: true },
    }),
  ]);

  const registeredIds = new Set(myRegistrations.map((r) => r.eventId));

  const byFilter = (e: (typeof events)[number]) => {
    if (filter === "upcoming") return e.eventDate >= now;
    if (filter === "past") return e.eventDate < now;
    return true;
  };

  const matches = (e: (typeof events)[number]) =>
    !query ||
    e.title.toLowerCase().includes(query) ||
    e.description.toLowerCase().includes(query) ||
    (e.category?.title ?? "").toLowerCase().includes(query) ||
    (e.location ?? "").toLowerCase().includes(query);

  const visible =
    tab === "registration"
      ? events.filter((e) => registeredIds.has(e.id) && matches(e))
      : events.filter((e) => byFilter(e) && matches(e));

  const hrefWith = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams();
    if (tab !== "event") params.set("tab", tab);
    if (filter !== "all") params.set("filter", filter);
    if (sort !== "oldest") params.set("sort", sort);
    if (query) params.set("q", q.trim());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    // Defaults stay out of the URL.
    if (params.get("filter") === "all") params.delete("filter");
    if (params.get("tab") === "event") params.delete("tab");
    if (params.get("sort") === "oldest") params.delete("sort");
    const qs = params.toString();
    return qs ? `/account/events?${qs}` : "/account/events";
  };

  return (
    <>
      <AccountTopBar
        title="Events"
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap items-center gap-6 border-b border-slate-200">
        {[
          { id: "event", label: "Event" },
          { id: "registration", label: "Registration" },
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
            {t.id === "registration" && registeredIds.size > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                {registeredIds.size}
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* Filters + search */}
      <div className="mt-6 flex items-center gap-3">
        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="flex w-max items-center gap-3 pb-1">
            {tab === "event" &&
              filters.map((f) => (
                <Link
                  key={f.id}
                  href={hrefWith({ filter: f.id })}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold ${
                    f.id === filter
                      ? "bg-primary text-white"
                      : "border border-slate-200 bg-white text-navy hover:bg-slate-50"
                  }`}
                >
                  <f.icon className="h-4 w-4" />
                  {f.label}
                </Link>
              ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <ArrowDownUp className="ml-1.5 h-3.5 w-3.5 text-slate-400" />
          {sorts.map((s) => (
            <Link
              key={s.id}
              href={hrefWith({ sort: s.id })}
              className={`rounded-md px-2.5 py-1.5 text-xs font-semibold ${
                s.id === sort
                  ? "bg-primary text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        <div className="shrink-0">
          <InlineSearch placeholder="Search events..." />
        </div>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16">
          <SearchX className="h-10 w-10 text-slate-300" />
          <p className="font-semibold text-navy">
            {tab === "registration"
              ? "No registrations yet"
              : "No events found"}
          </p>
          <p className="text-sm text-slate-500">
            {tab === "registration"
              ? "Register for an event and it will show up here."
              : "Try another filter or search term."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {visible.map((e) => {
            const palette = eventPalette(
              e.category?.color,
              e.category?.title ?? e.title,
            );
            const taken = e._count.registrations;
            const left =
              e.capacity === null ? null : Math.max(e.capacity - taken, 0);
            const isRegistered = registeredIds.has(e.id);
            const isPast = e.eventDate < now;
            const isFull = left !== null && left === 0;
            // An event with no form, or one with registration switched off,
            // takes no sign-ups at all.
            const needsRegistration =
              e.registrationForm?.registrationEnabled ?? false;
            const formState = e.registrationForm
              ? formStatus(e.registrationForm, now)
              : null;

            return (
              <article
                key={e.id}
                className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row"
              >
                {/* Cover */}
                <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-navy lg:h-44 lg:w-64">
                  {e.coverImage ? (
                    <Image
                      src={e.coverImage}
                      alt={e.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 256px, 100vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-4 text-center text-sm font-bold uppercase tracking-wide text-white/90">
                      {e.title}
                    </div>
                  )}
                </div>

                {/* Detail */}
                <div className="min-w-0 flex-1">
                  {e.category && (
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${palette.badge}`}
                    >
                      {e.category.title}
                    </span>
                  )}
                  <h2 className="mt-2 text-lg font-bold text-navy">
                    {e.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{e.description}</p>

                  <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-slate-400" />
                      {eventDateLabel(e.eventDate)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      {timeRange(e.eventDate, e.endDate)}
                    </p>
                    {e.location && (
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {e.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="flex shrink-0 flex-col items-stretch justify-center gap-2 lg:w-40">
                  {/* One button whatever the state: read the event first, sign
                      up at the bottom of its own page. */}
                  <Link
                    href={`/account/events/${e.slug}`}
                    className="block w-full rounded-lg bg-primary px-6 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-dark"
                  >
                    View details
                  </Link>

                  {/* Where the card's button used to say it. */}
                  {isPast ? (
                    <p className="text-center text-xs font-semibold text-slate-400">
                      Ended
                    </p>
                  ) : !needsRegistration ? (
                    <p className="text-center text-xs font-semibold text-slate-400">
                      No registration needed
                    </p>
                  ) : isRegistered ? (
                    <p className="flex items-center justify-center gap-1 text-xs font-semibold text-primary">
                      <Check className="h-3.5 w-3.5" />
                      Registered
                    </p>
                  ) : formState === "not-yet" ? (
                    <p className="text-center text-xs font-semibold text-amber-600">
                      {e.registrationForm?.opensAt
                        ? `Opens ${eventDateLabel(e.registrationForm.opensAt)}`
                        : "Opens soon"}
                    </p>
                  ) : formState === "closed" ? (
                    <p className="text-center text-xs font-semibold text-slate-400">
                      Registration closed
                    </p>
                  ) : isFull ? (
                    <p className="text-center text-xs font-semibold text-slate-400">
                      Full
                    </p>
                  ) : null}

                  {left !== null && (
                    <p
                      className={`text-center text-xs font-semibold ${palette.seats}`}
                    >
                      {left} / {e.capacity} {e.seatUnit} left
                    </p>
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
