import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Events",
  description: "Browse all upcoming and past events hosted by ICUnpar.",
};

const PAGE_SIZE = 9;

export default async function AllEventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    category?: string;
    page?: string;
    q?: string;
  }>;
}) {
  const { tab: tabParam, category, page: pageParam, q } = await searchParams;
  const tab = tabParam === "latest" ? "latest" : "upcoming";
  const page = Math.max(1, Number(pageParam) || 1);
  const query = q?.trim() ?? "";
  const now = new Date();

  const categories = await prisma.eventCategory.findMany({
    orderBy: { order: "asc" },
    select: { title: true, slug: true },
  });

  const where = {
    published: true,
    eventDate: tab === "upcoming" ? { gte: now } : { lt: now },
    ...(category ? { category: { slug: category } } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { description: { contains: query, mode: "insensitive" as const } },
            { location: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { category: { select: { title: true, slug: true } } },
      orderBy: { eventDate: tab === "upcoming" ? "asc" : "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.event.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (params: {
    tab?: string;
    category?: string;
    page?: number;
  }) => {
    const usp = new URLSearchParams();
    if (params.tab && params.tab !== "upcoming") usp.set("tab", params.tab);
    if (params.category) usp.set("category", params.category);
    if (query) usp.set("q", query);
    if (params.page && params.page > 1) usp.set("page", String(params.page));
    const qs = usp.toString();
    return qs ? `/events/all?${qs}` : "/events/all";
  };

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-primary-light/40 to-white">
        <div className="container-page py-14 lg:py-16">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>

          <div className="mx-auto mt-8 max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Events & Activities
            </span>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
              All Events
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Browse every event hosted by ICUnpar, upcoming and past, across
              all categories.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <SearchBar
          action="/events/all"
          placeholder="Search events..."
          defaultValue={query}
          hidden={{ category, tab: tab === "latest" ? "latest" : undefined }}
        />

        {/* Upcoming / Latest tabs */}
        <div className="mx-auto mt-6 flex w-fit gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
          <Link
            href={buildHref({ tab: "upcoming", category })}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === "upcoming"
                ? "bg-primary text-white"
                : "text-slate-600 hover:text-primary"
            }`}
          >
            Upcoming Events
          </Link>
          <Link
            href={buildHref({ tab: "latest", category })}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === "latest"
                ? "bg-primary text-white"
                : "text-slate-600 hover:text-primary"
            }`}
          >
            Latest Events
          </Link>
        </div>

        {/* Category filters */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href={buildHref({ tab })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              !category
                ? "bg-primary text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={buildHref({ tab, category: c.slug })}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                category === c.slug
                  ? "bg-primary text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"
              }`}
            >
              {c.title}
            </Link>
          ))}
        </div>

        {/* Grid */}
        {events.length === 0 ? (
          <div className="mt-10 flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <EmptyState
              message={
                query
                  ? `No ${tab === "upcoming" ? "upcoming" : "past"} events match “${query}”.`
                  : `No ${tab === "upcoming" ? "upcoming" : "past"} events in this category yet.`
              }
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="card overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video bg-slate-100">
                  <Image
                    src={event.coverImage || "/images/research-seminar.png"}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="p-4">
                  {event.category && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {event.category.title}
                    </span>
                  )}
                  <h3 className="mt-1 font-bold text-navy">{event.title}</h3>
                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(event.eventDate)}
                    </p>
                    {event.location && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-1">
            <Link
              href={buildHref({ tab, category, page: Math.max(1, page - 1) })}
              aria-disabled={page === 1}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 ${
                page === 1
                  ? "pointer-events-none opacity-40"
                  : "hover:border-primary hover:text-primary"
              }`}
            >
              ‹
            </Link>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildHref({ tab, category, page: p })}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${
                  p === page
                    ? "bg-primary text-white"
                    : "border border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                }`}
              >
                {p}
              </Link>
            ))}
            <Link
              href={buildHref({
                tab,
                category,
                page: Math.min(totalPages, page + 1),
              })}
              aria-disabled={page === totalPages}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 ${
                page === totalPages
                  ? "pointer-events-none opacity-40"
                  : "hover:border-primary hover:text-primary"
              }`}
            >
              ›
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
