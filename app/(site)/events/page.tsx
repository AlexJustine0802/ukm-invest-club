import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import StaggerGrid from "@/components/StaggerGrid";
import EventHeroSlider, {
  type HeroEventSlide,
} from "@/components/EventHeroSlider";
import EventCategoriesInteractive, {
  type EventCategoryWithPreview,
} from "@/components/EventCategoriesInteractive";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { TextAnimate } from "@/components/ui/text-animate";
import { EVENT_TIME_ZONE, timeRange } from "@/lib/eventStyles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past events hosted by Parahyangan Finance Club.",
};

type EventDisplay = {
  slug: string;
  title: string;
  description: string;
  type: string;
  date: Date;
  endDate: Date | null;
  location: string;
  image: string;
  participants?: string;
  /** Slug of the linked public registration form, when the admin set one. */
  registrationSlug?: string | null;
  /** False when the admin switched registration off for this event. */
  registrationEnabled: boolean;
};

type DbEvent = {
  slug: string;
  title: string;
  description: string;
  eventDate: Date;
  endDate: Date | null;
  location: string | null;
  coverImage: string | null;
  registrationForm?: {
    slug: string;
    published: boolean;
    registrationEnabled: boolean;
  } | null;
};

const eventImages = [
  "/images/research-seminar.png",
  "/images/research-modeling.png",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
];

function cleanDescription(description: string) {
  return description
    .replace(/[#*_>`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferEventType(title: string, index: number) {
  const lower = title.toLowerCase();
  if (lower.includes("workshop")) return "Workshop";
  if (lower.includes("talk") || lower.includes("discussion")) return "Talkshow";
  if (lower.includes("challenge") || lower.includes("competition")) {
    return "Competition";
  }
  if (lower.includes("training") || lower.includes("bootcamp"))
    return "Training";
  return ["Seminar", "Workshop", "Talkshow", "Training", "Competition"][
    index % 5
  ];
}

function normalizeEvent(event: DbEvent, index: number): EventDisplay {
  return {
    slug: event.slug,
    title: event.title,
    description: cleanDescription(event.description),
    type: inferEventType(event.title, index),
    date: event.eventDate,
    endDate: event.endDate,
    location: event.location ?? "Universitas Katolik Parahyangan",
    image: event.coverImage ?? eventImages[index % eventImages.length],
    registrationSlug:
      event.registrationForm?.published &&
      event.registrationForm.registrationEnabled
        ? event.registrationForm.slug
        : null,
    // No form at all still counts as "no registration needed" rather than a
    // broken button, so the default here is false, not true.
    registrationEnabled: event.registrationForm?.registrationEnabled ?? false,
  };
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    timeZone: EVENT_TIME_ZONE,
  }).format(date);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    timeZone: EVENT_TIME_ZONE,
  })
    .format(date)
    .toUpperCase();
}

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: EVENT_TIME_ZONE,
  }).format(date);
}

// Every event on this page now comes from the database, so its detail page
// always exists.
function eventHref(event: EventDisplay) {
  return `/events/${event.slug}`;
}

function SectionHeader({
  title,
  action,
  href = "/events",
}: {
  title: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <TextAnimate
        as="h2"
        animation="blurInUp"
        by="character"
        once
        className="text-sm font-semibold uppercase tracking-widest text-primary"
      >
        {title}
      </TextAnimate>
      {action && (
        <Link
          href={href}
          className="hidden items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dark sm:inline-flex"
        >
          {action}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function DateBadge({ event }: { event: EventDisplay }) {
  return (
    <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-md bg-primary text-white shadow-sm">
      <span className="text-3xl font-extrabold leading-none">
        {formatDay(event.date)}
      </span>
      <span className="mt-1 text-xs font-extrabold uppercase">
        {formatMonth(event.date)}
      </span>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="w-fit rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-extrabold uppercase text-primary">
      {type}
    </span>
  );
}

function UpcomingCard({ event }: { event: EventDisplay }) {
  return (
    <article className="relative min-h-[285px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <Image
        src={event.image}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 360px"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/10" />
      <div className="relative flex h-full gap-4 p-5">
        <DateBadge event={event} />
        <div className="min-w-0 pr-3">
          <TypeBadge type={event.type} />
          <h3 className="mt-3 text-base font-extrabold leading-6 text-navy">
            {event.title}
          </h3>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
            {event.description}
          </p>
          <div className="mt-6 space-y-2 text-xs font-semibold text-slate-600">
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-navy" />
              {timeRange(event.date, event.endDate)}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-navy" />
              {event.location}
            </p>
          </div>
          {/* Always the detail page: what the event is comes before signing
              up for it, and the sign-up button lives at the bottom there. */}
          <Link
            href={eventHref(event)}
            className="btn-primary mt-6 px-5 py-2 text-xs"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

function CalendarRow({ event }: { event: EventDisplay }) {
  return (
    <div className="grid gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0 lg:grid-cols-[72px_1fr_220px_110px] lg:items-center">
      <div className="flex h-16 w-14 flex-col items-center justify-center rounded-md bg-blue-50 text-navy">
        <span className="text-2xl font-extrabold leading-none">
          {formatDay(event.date)}
        </span>
        <span className="mt-1 text-xs font-extrabold uppercase text-slate-500">
          {formatMonth(event.date)}
        </span>
      </div>
      <div>
        <TypeBadge type={event.type} />
        <h3 className="mt-2 font-extrabold leading-6 text-navy">
          {event.title}
        </h3>
      </div>
      <div className="space-y-2 text-sm font-semibold text-slate-600">
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-slate-500" />
          {timeRange(event.date, event.endDate)}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          {event.location}
        </p>
      </div>
      <Link
        href={eventHref(event)}
        className="btn-primary justify-self-start px-6 py-2 text-xs lg:justify-self-end"
      >
        View details
      </Link>
    </div>
  );
}

function PastEventCard({ event }: { event: EventDisplay }) {
  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="relative aspect-[16/9] bg-slate-100">
        <Image
          src={event.image}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 280px"
          className="object-cover"
        />
      </div>
      <div className="p-5">
        <TypeBadge type={event.type} />
        <h3 className="mt-3 text-base font-extrabold text-navy">
          {event.title}
        </h3>
        <div className="mt-4 space-y-2 text-sm font-semibold text-slate-600">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" />
            {formatFullDate(event.date)}
          </p>
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            {event.participants ?? "100+ Participants"}
          </p>
        </div>
      </div>
    </article>
  );
}

export default async function EventsPage() {
  const now = new Date();
  let upcomingEvents: DbEvent[] = [];
  let pastEvents: DbEvent[] = [];
  let categoriesWithPreview: EventCategoryWithPreview[] = [];

  try {
    const [upcomingRows, pastRows, categoryRows] = await Promise.all([
      prisma.event.findMany({
        where: { published: true, eventDate: { gte: now } },
        orderBy: { eventDate: "asc" },
        take: 5,
        include: {
          registrationForm: {
            select: {
              slug: true,
              published: true,
              registrationEnabled: true,
            },
          },
        },
      }),
      prisma.event.findMany({
        where: { published: true, eventDate: { lt: now } },
        orderBy: { eventDate: "desc" },
        take: 4,
      }),
      prisma.eventCategory.findMany({
        orderBy: { order: "asc" },
        include: {
          events: {
            where: { published: true, eventDate: { gte: now } },
            orderBy: { eventDate: "asc" },
            take: 3,
          },
        },
      }),
    ]);
    upcomingEvents = upcomingRows;
    pastEvents = pastRows;
    categoriesWithPreview = categoryRows.map((c) => ({
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description,
      icon: c.icon,
      events: c.events.map((e) => ({
        slug: e.slug,
        title: e.title,
        dateLabel: formatFullDate(e.eventDate),
        href: `/events/${e.slug}`,
      })),
    }));
  } catch (error) {
    console.warn(
      "Unable to load events from database, using fallback content.",
      error,
    );
  }

  // No fallback content. These used to fall back to a hardcoded demo list,
  // which meant deleting every event in the admin left five invented ones on
  // the public page with Register buttons that went nowhere. An empty database
  // must read as empty.
  const upcoming = upcomingEvents.map((event, index) =>
    normalizeEvent(event, index),
  );

  const past = pastEvents.map((event, index) => ({
    ...normalizeEvent(event, index),
    participants: [
      "120+ Participants",
      "80+ Participants",
      "150+ Participants",
      "200+ Participants",
    ][index % 4],
  }));

  // Hero shows the ticked ("featured") events; falls back to upcoming events.
  const featuredRows = await prisma.event
    .findMany({
      where: { published: true, featured: true },
      orderBy: { eventDate: "asc" },
      take: 5,
      include: {
        registrationForm: {
          select: { slug: true, published: true, registrationEnabled: true },
        },
      },
    })
    .catch(() => [] as DbEvent[]);

  const heroSource =
    featuredRows.length > 0
      ? featuredRows.map((event, index) => normalizeEvent(event, index))
      : upcoming.slice(0, 5);

  const heroSlides: HeroEventSlide[] = heroSource.map((event) => ({
    title: event.title,
    image: event.image,
    dateLabel: formatFullDate(event.date),
    timeLabel: timeRange(event.date, event.endDate),
    location: event.location,
    href: eventHref(event),
    badge: featuredRows.length > 0 ? "Featured" : "Next Event",
  }));

  return (
    <div className="bg-white text-navy">
      <Reveal
        as="section"
        className="relative overflow-hidden border-b border-blue-50 bg-white"
      >
        <div className="absolute left-0 top-0 h-40 w-56 bg-[radial-gradient(circle_at_center,#93b4ff_1.5px,transparent_1.5px)] opacity-60 [background-size:24px_24px]" />
        <div className="absolute bottom-4 left-[19%] h-24 w-24 rounded-full bg-primary-light/75" />
        <div className="absolute bottom-12 right-[54%] h-36 w-36 rounded-full bg-primary-light/70" />

        <div className="container-page relative grid min-h-[470px] items-center gap-10 py-14 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="max-w-xl">
            <h1 className="site-hero-title mt-5">
              <TextAnimate
                as="span"
                animation="blurInUp"
                by="character"
                once
                className="block"
              >
                Learn, Connect,
              </TextAnimate>
              <TextAnimate
                as="span"
                animation="blurInUp"
                by="character"
                once
                className="block"
              >
                Grow Together
              </TextAnimate>
            </h1>
            <TextAnimate
              as="p"
              animation="blurInUp"
              by="word"
              once
              className="site-hero-copy mt-6 max-w-lg"
            >
              Join a range of activities and events designed to expand your
              knowledge, sharpen your skills, and build your network in
              finance.
            </TextAnimate>
            <div className="site-hero-actions">
              <InteractiveHoverButton
                href="#upcoming-events"
                className="bg-primary text-white"
                fillClassName="bg-white"
                hoverTextClassName="text-primary"
              >
                Upcoming Events
              </InteractiveHoverButton>
              <InteractiveHoverButton
                href="#past-events"
                className="border-primary bg-transparent text-primary"
              >
                Past Events
              </InteractiveHoverButton>
            </div>
          </div>

          <EventHeroSlider slides={heroSlides} />
        </div>
      </Reveal>

      <Reveal as="section" id="upcoming-events" className="container-page py-9">
        <SectionHeader
          title="Upcoming Events"
          action="View All Events"
          href="/events/all"
        />
        {/* min-h matches one card row, so the section keeps its shape with no
            events rather than collapsing the page around it. */}
        {upcoming.length > 0 ? (
          <StaggerGrid className="grid gap-6 lg:grid-cols-3">
            {upcoming.slice(0, 3).map((event) => (
              <UpcomingCard key={event.slug} event={event} />
            ))}
          </StaggerGrid>
        ) : (
          <div className="flex min-h-[285px] items-center justify-center rounded-lg border border-slate-200 bg-white">
            <EmptyState message="No upcoming events scheduled. Check back soon!" />
          </div>
        )}
      </Reveal>

      <Reveal
        as="section"
        className="container-page border-t border-slate-100 py-9"
      >
        <SectionHeader title="Event Categories" />
        <EventCategoriesInteractive categories={categoriesWithPreview} />
      </Reveal>

      <Reveal
        as="section"
        id="calendar"
        className="container-page border-t border-slate-100 py-9"
      >
        <SectionHeader
          title="Upcoming Events Calendar"
          action="View All Events"
          href="/events/all"
        />
        <div className="flex min-h-[140px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {upcoming.length > 0 ? (
            upcoming
              .slice(0, 5)
              .map((event) => <CalendarRow key={event.slug} event={event} />)
          ) : (
            <div className="flex flex-1 items-center justify-center py-10">
              <EmptyState message="Nothing on the calendar yet." />
            </div>
          )}
        </div>
        {/* Nothing to load more of when the calendar is empty. */}
        {upcoming.length > 0 && (
          <div className="mt-5 flex justify-center">
            <Link
              href="/events/all"
              className="inline-flex min-w-72 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-navy shadow-sm transition-colors hover:bg-slate-50"
            >
              Load More Events
              <ChevronDown className="h-4 w-4" />
            </Link>
          </div>
        )}
      </Reveal>

      <Reveal
        as="section"
        id="past-events"
        className="container-page border-t border-slate-100 py-9"
      >
        <SectionHeader
          title="Past Events Highlights"
          action="View All Past Events"
          href="/events/all?tab=latest"
        />
        {past.length > 0 ? (
          <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {past.slice(0, 4).map((event) => (
              <PastEventCard key={event.slug} event={event} />
            ))}
          </StaggerGrid>
        ) : (
          <div className="flex min-h-[240px] items-center justify-center rounded-lg border border-slate-200 bg-white">
            <EmptyState message="No past events to show yet." />
          </div>
        )}
      </Reveal>
    </div>
  );
}
