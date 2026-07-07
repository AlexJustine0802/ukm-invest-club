import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Presentation,
  Share2,
  Trophy,
  Users,
  Wrench,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past events hosted by ICUnpar.",
};

type EventDisplay = {
  slug: string;
  title: string;
  description: string;
  type: string;
  date: Date;
  endDate: Date;
  location: string;
  image: string;
  participants?: string;
};

type DbEvent = {
  slug: string;
  title: string;
  description: string;
  eventDate: Date;
  location: string | null;
  coverImage: string | null;
};

type EventCategory = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const eventImages = [
  "/images/research-seminar.png",
  "/images/research-modeling.png",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
];

const fallbackUpcoming: EventDisplay[] = [
  {
    slug: "investment-outlook-2026",
    title: "Investment Outlook 2026: Navigating the Uncertainty",
    description:
      "Analisis kondisi pasar global dan strategi investasi di tengah ketidakpastian ekonomi.",
    type: "Seminar",
    date: new Date("2026-07-25T09:00:00+07:00"),
    endDate: new Date("2026-07-25T12:00:00+07:00"),
    location: "Auditorium FEB Unpar",
    image: "/images/research-seminar.png",
  },
  {
    slug: "financial-modeling-for-investment-analysis",
    title: "Financial Modeling for Investment Analysis",
    description:
      "Belajar membangun model keuangan untuk analisis dan valuasi perusahaan.",
    type: "Workshop",
    date: new Date("2026-08-08T13:00:00+07:00"),
    endDate: new Date("2026-08-08T16:00:00+07:00"),
    location: "Lab. Capital Market",
    image: "/images/research-modeling.png",
  },
  {
    slug: "career-in-finance",
    title: "Career in Finance: Pathways & Preparation",
    description:
      "Bersama profesional di bidang keuangan dan investasi.",
    type: "Talkshow",
    date: new Date("2026-08-22T09:00:00+07:00"),
    endDate: new Date("2026-08-22T12:00:00+07:00"),
    location: "Auditorium FEB Unpar",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "introduction-to-stock-valuation",
    title: "Introduction to Stock Valuation",
    description:
      "Program pelatihan valuasi saham menggunakan pendekatan fundamental.",
    type: "Training",
    date: new Date("2026-09-06T13:00:00+07:00"),
    endDate: new Date("2026-09-06T16:00:00+07:00"),
    location: "Lab. Capital Market",
    image: "/images/research-modeling.png",
  },
  {
    slug: "icu-investment-challenge-2026",
    title: "ICU Investment Challenge 2026",
    description:
      "Kompetisi analisis investasi untuk mengasah riset dan presentasi.",
    type: "Competition",
    date: new Date("2026-09-20T09:00:00+07:00"),
    endDate: new Date("2026-09-20T17:00:00+07:00"),
    location: "Auditorium FEB Unpar",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  },
];

const fallbackPast: EventDisplay[] = [
  {
    slug: "economic-outlook-2026",
    title: "Economic Outlook 2026",
    description: "Market outlook seminar with guest speakers.",
    type: "Seminar",
    date: new Date("2026-04-15T09:00:00+07:00"),
    endDate: new Date("2026-04-15T12:00:00+07:00"),
    location: "Auditorium FEB Unpar",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
    participants: "120+ Participants",
  },
  {
    slug: "technical-analysis-workshop",
    title: "Technical Analysis Workshop",
    description: "Hands-on session for reading charts and indicators.",
    type: "Workshop",
    date: new Date("2026-03-30T13:00:00+07:00"),
    endDate: new Date("2026-03-30T16:00:00+07:00"),
    location: "Lab. Capital Market",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    participants: "80+ Participants",
  },
  {
    slug: "women-in-finance",
    title: "Women in Finance",
    description: "Panel discussion with finance professionals.",
    type: "Talkshow",
    date: new Date("2026-03-10T09:00:00+07:00"),
    endDate: new Date("2026-03-10T12:00:00+07:00"),
    location: "Auditorium FEB Unpar",
    image:
      "https://images.unsplash.com/photo-1515169067865-5387ec356754?auto=format&fit=crop&w=1200&q=80",
    participants: "150+ Participants",
  },
  {
    slug: "investment-challenge-2025",
    title: "Investment Challenge 2025",
    description: "Student investment analysis competition.",
    type: "Competition",
    date: new Date("2026-01-28T09:00:00+07:00"),
    endDate: new Date("2026-01-28T17:00:00+07:00"),
    location: "Auditorium FEB Unpar",
    image:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
    participants: "200+ Participants",
  },
];

const fallbackSlugs = new Set(
  [...fallbackUpcoming, ...fallbackPast].map((event) => event.slug),
);

const eventCategories: EventCategory[] = [
  {
    title: "Seminar",
    description: "Sesi berbagi ilmu dan wawasan mendalam",
    icon: Building2,
  },
  {
    title: "Workshop",
    description: "Pelatihan praktis untuk mengasah keterampilan",
    icon: Wrench,
  },
  {
    title: "Talkshow",
    description: "Diskusi inspiratif bersama para profesional",
    icon: MessageCircle,
  },
  {
    title: "Training",
    description: "Program pelatihan terstruktur",
    icon: Presentation,
  },
  {
    title: "Competition",
    description: "Kompetisi investasi dan analisis",
    icon: Trophy,
  },
  {
    title: "Networking",
    description: "Bangun koneksi dan perluas relasi",
    icon: Share2,
  },
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
  if (lower.includes("training") || lower.includes("bootcamp")) return "Training";
  return ["Seminar", "Workshop", "Talkshow", "Training", "Competition"][index % 5];
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function normalizeEvent(
  event: DbEvent,
  index: number,
): EventDisplay {
  return {
    slug: event.slug,
    title: event.title,
    description: cleanDescription(event.description),
    type: inferEventType(event.title, index),
    date: event.eventDate,
    endDate: addHours(event.eventDate, 3),
    location: event.location ?? "Universitas Katolik Parahyangan",
    image: event.coverImage ?? eventImages[index % eventImages.length],
  };
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    timeZone: "Asia/Jakarta",
  })
    .format(date)
    .toUpperCase();
}

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function formatTimeRange(start: Date, end: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  });

  return `${formatter.format(start).replace(":", ".")} - ${formatter
    .format(end)
    .replace(":", ".")} WIB`;
}

function eventHref(event: EventDisplay) {
  return fallbackSlugs.has(event.slug) ? "/events" : `/events/${event.slug}`;
}

function SectionHeader({
  number,
  title,
  action,
  href = "/events",
}: {
  number: string;
  title: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h2 className="text-sm font-extrabold uppercase tracking-tight text-navy">
        <span className="text-primary">{number}.</span> {title}
      </h2>
      {action && (
        <Link
          href={href}
          className="hidden items-center gap-2 text-sm font-bold text-primary transition-colors hover:text-primary-dark sm:inline-flex"
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
              {formatTimeRange(event.date, event.endDate)}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-navy" />
              {event.location}
            </p>
          </div>
          <Link href={eventHref(event)} className="btn-navy mt-6 px-5 py-2 text-xs">
            Register Now
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
          {formatTimeRange(event.date, event.endDate)}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-500" />
          {event.location}
        </p>
      </div>
      <Link href={eventHref(event)} className="btn-navy justify-self-start px-6 py-2 text-xs lg:justify-self-end">
        Register
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
        <h3 className="mt-3 text-base font-extrabold text-navy">{event.title}</h3>
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

  try {
    [upcomingEvents, pastEvents] = await Promise.all([
      prisma.event.findMany({
        where: { published: true, eventDate: { gte: now } },
        orderBy: { eventDate: "asc" },
        take: 5,
      }),
      prisma.event.findMany({
        where: { published: true, eventDate: { lt: now } },
        orderBy: { eventDate: "desc" },
        take: 4,
      }),
    ]);
  } catch (error) {
    console.warn("Unable to load events from database, using fallback content.", error);
  }

  const upcoming =
    upcomingEvents.length > 0
      ? upcomingEvents.map((event, index) => normalizeEvent(event, index))
      : fallbackUpcoming;

  const past =
    pastEvents.length > 0
      ? pastEvents.map((event, index) => ({
          ...normalizeEvent(event, index),
          participants: ["120+ Participants", "80+ Participants", "150+ Participants", "200+ Participants"][
            index % 4
          ],
        }))
      : fallbackPast;

  const featuredEvent = upcoming[0];

  return (
    <div className="bg-white text-navy">
      <section className="relative overflow-hidden border-b border-blue-50 bg-white">
        <div className="absolute left-0 top-0 h-40 w-56 bg-[radial-gradient(circle_at_center,#93b4ff_1.5px,transparent_1.5px)] opacity-60 [background-size:24px_24px]" />
        <div className="absolute bottom-4 left-[19%] h-24 w-24 rounded-full bg-primary-light/75" />
        <div className="absolute bottom-12 right-[54%] h-36 w-36 rounded-full bg-primary-light/70" />

        <div className="container-page relative grid min-h-[470px] items-center gap-10 py-14 lg:grid-cols-[0.88fr_1.12fr]">
          <div className="max-w-xl">
            <p className="text-sm font-extrabold uppercase tracking-wide text-primary">
              Events & Activities
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-navy sm:text-5xl">
              Learn, Connect,
              <br />
              Grow Together
            </h1>
            <p className="mt-6 max-w-lg text-base font-medium leading-7 text-slate-600">
              Bergabunglah dalam berbagai kegiatan dan event yang dirancang
              untuk memperluas wawasan, mengasah skill, dan membangun jaringan
              di dunia investasi.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="#upcoming-events" className="btn-navy">
                Upcoming Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="#past-events" className="btn-secondary border-slate-300 text-navy hover:border-primary hover:text-primary">
                Past Events
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-lg bg-navy shadow-xl">
              <div className="relative h-[315px] sm:h-[390px]">
                <Image
                  src={featuredEvent.image}
                  alt=""
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 650px"
                  className="object-cover"
                />
                <div className="absolute inset-x-7 bottom-7 max-w-sm rounded-lg bg-white p-6 shadow-xl">
                  <TypeBadge type="Next Event" />
                  <h2 className="mt-3 text-lg font-extrabold leading-6 text-navy">
                    {featuredEvent.title}
                  </h2>
                  <div className="mt-4 space-y-2 text-sm font-semibold text-slate-600">
                    <p className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-navy" />
                      {formatFullDate(featuredEvent.date)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-navy" />
                      {formatTimeRange(featuredEvent.date, featuredEvent.endDate)}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-navy" />
                      {featuredEvent.location}
                    </p>
                  </div>
                  <Link
                    href={eventHref(featuredEvent)}
                    aria-label="Open next event"
                    className="absolute bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white shadow-lg transition-transform hover:scale-105"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-5 flex justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>
      </section>

      <section id="upcoming-events" className="container-page py-9">
        <SectionHeader number="1" title="Upcoming Events" action="View All Events" href="#calendar" />
        <div className="grid gap-6 lg:grid-cols-3">
          {upcoming.slice(0, 3).map((event) => (
            <UpcomingCard key={event.slug} event={event} />
          ))}
        </div>
      </section>

      <section className="container-page border-t border-slate-100 py-9">
        <SectionHeader number="2" title="Event Categories" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {eventCategories.map((category) => (
            <article
              key={category.title}
              className="rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-primary">
                <category.icon className="h-8 w-8" />
              </span>
              <h3 className="mt-5 text-base font-extrabold text-navy">
                {category.title}
              </h3>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                {category.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="calendar" className="container-page border-t border-slate-100 py-9">
        <SectionHeader number="3" title="Upcoming Events Calendar" action="View Calendar" href="#calendar" />
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {upcoming.slice(0, 5).map((event) => (
            <CalendarRow key={event.slug} event={event} />
          ))}
        </div>
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            className="inline-flex min-w-72 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-navy shadow-sm transition-colors hover:bg-slate-50"
          >
            Load More Events
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section id="past-events" className="container-page border-t border-slate-100 py-9">
        <SectionHeader number="4" title="Past Events Highlights" action="View All Past Events" href="#past-events" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {past.slice(0, 4).map((event) => (
            <PastEventCard key={event.slug} event={event} />
          ))}
        </div>
      </section>

      <section className="container-page pb-8 pt-2">
        <div className="relative overflow-hidden rounded-lg bg-navy-dark p-7 text-white shadow-lg">
          <div className="absolute right-0 top-0 h-full w-44 bg-[radial-gradient(circle_at_center,#93b4ff_1.4px,transparent_1.4px)] opacity-75 [background-size:20px_20px]" />
          <div className="relative grid items-center gap-6 lg:grid-cols-[auto_1fr_auto]">
            <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/40 text-white">
              <Mail className="h-8 w-8" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold">
                Jangan Lewatkan Event Menarik!
              </h2>
              <p className="mt-2 text-sm text-blue-100">
                Dapatkan informasi terbaru tentang event dan kegiatan kami.
              </p>
            </div>
            <form className="flex w-full flex-col gap-3 sm:flex-row lg:w-[420px]">
              <label htmlFor="event-email" className="sr-only">
                Email address
              </label>
              <input
                id="event-email"
                type="email"
                placeholder="Enter your email"
                className="min-h-11 flex-1 rounded-md border border-white/20 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-blue-100 focus:border-white/50"
              />
              <button type="submit" className="btn-primary min-h-11 px-6">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
