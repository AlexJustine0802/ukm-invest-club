import Link from "next/link";
import { ArrowRight, Calendar, Users, FileText, CalendarDays, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import EventCard from "@/components/EventCard";
import PublicationCard from "@/components/PublicationCard";
import PartnerStrip from "@/components/PartnerStrip";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const now = new Date();

  const [upcomingEvents, latestPublications, eventCount, pubCount, memberCount] =
    await Promise.all([
      prisma.event.findMany({
        where: { published: true, eventDate: { gte: now } },
        orderBy: { eventDate: "asc" },
        take: 3,
      }),
      prisma.publication.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
      }),
      prisma.event.count({ where: { published: true } }),
      prisma.publication.count({ where: { published: true } }),
      prisma.teamMember.count(),
    ]);

  // Fall back to most recent past events if nothing upcoming.
  const featuredEvents =
    upcomingEvents.length > 0
      ? upcomingEvents
      : await prisma.event.findMany({
          where: { published: true },
          orderBy: { eventDate: "desc" },
          take: 3,
        });

  const impact = [
    { icon: Users, value: `${memberCount}+`, label: "Active Members" },
    { icon: FileText, value: `${pubCount}+`, label: "Research Published" },
    { icon: CalendarDays, value: `${eventCount}+`, label: "Events Held" },
    { icon: Building2, value: "15+", label: "Partners" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-light/40 to-white">
        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Learn. Analyze. Grow Together.
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-navy sm:text-5xl lg:text-6xl">
              Empowering Future{" "}
              <span className="text-primary">Investors</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600">
              {site.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/publications" className="btn-primary">
                Explore Research
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/events" className="btn-secondary">
                <Calendar className="mr-2 h-4 w-4" />
                View Events
              </Link>
            </div>
          </div>

          {/* Static Market Overview widget */}
          <MarketOverview
            memberCount={memberCount}
            pubCount={pubCount}
            eventCount={eventCount}
          />
        </div>
      </section>

      {/* About strip */}
      <section className="container-page py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              About Us
            </span>
            <h2 className="mt-3 text-3xl font-bold text-navy">
              Building Knowledge, Creating Impact
            </h2>
            <p className="mt-4 text-slate-600">
              {site.fullName} ({site.name}) is a student-run investment club
              focused on financial literacy, market analysis, and self-growth —
              creating smart, competitive investors.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark"
            >
              Learn More About Us
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
          <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-400">
            <Users className="h-16 w-16" />
          </div>
        </div>
      </section>

      {/* Latest Research */}
      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-navy">Latest Research</h2>
              <p className="mt-2 text-slate-600">
                Research, insights, and learning resources from our members.
              </p>
            </div>
            <Link
              href="/publications"
              className="hidden text-sm font-semibold text-primary hover:text-primary-dark sm:block"
            >
              View All Research →
            </Link>
          </div>
          {latestPublications.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPublications.map((pub) => (
                <PublicationCard key={pub.id} publication={pub} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-slate-500">No publications yet.</p>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-navy">
              {upcomingEvents.length > 0 ? "Upcoming Events" : "Recent Events"}
            </h2>
            <p className="mt-2 text-slate-600">
              Join our activities and grow your investing skills.
            </p>
          </div>
          <Link
            href="/events"
            className="hidden text-sm font-semibold text-primary hover:text-primary-dark sm:block"
          >
            View All Events →
          </Link>
        </div>
        {featuredEvents.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-slate-500">No events yet. Check back soon!</p>
        )}
      </section>

      {/* Impact */}
      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Our Impact
          </span>
          <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {impact.map((stat) => (
              <div
                key={stat.label}
                className="card flex items-center gap-4 p-6"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                  <stat.icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-2xl font-extrabold text-navy sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PartnerStrip />
    </>
  );
}

function MarketOverview({
  memberCount,
  pubCount,
  eventCount,
}: {
  memberCount: number;
  pubCount: number;
  eventCount: number;
}) {
  const tickers = [
    { code: "BBCA", price: "9,525", change: "+1.34%", up: true },
    { code: "TLKM", price: "2,820", change: "-0.70%", up: false },
    { code: "BBRI", price: "4,730", change: "+0.85%", up: true },
    { code: "BMRI", price: "6,125", change: "+1.30%", up: true },
  ];

  return (
    <div className="card animate-fade-up p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Market Overview</p>
          <p className="text-xs text-slate-400">IHSG Index</p>
        </div>
        <span className="badge bg-success/10 text-success">1D</span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-navy">7,274.44</span>
        <span className="text-sm font-medium text-success">+1.24% (88.94)</span>
      </div>

      {/* decorative sparkline */}
      <svg
        viewBox="0 0 300 80"
        className="mt-4 h-20 w-full"
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          stroke="#144DC8"
          strokeWidth="2"
          points="0,60 30,55 60,58 90,45 120,48 150,35 180,38 210,25 240,28 270,15 300,10"
        />
        <polygon
          fill="#144DC8"
          fillOpacity="0.08"
          points="0,60 30,55 60,58 90,45 120,48 150,35 180,38 210,25 240,28 270,15 300,10 300,80 0,80"
        />
      </svg>

      <div className="mt-4 grid grid-cols-3 gap-2 border-y border-slate-100 py-3 text-center">
        <Stat value={`${pubCount}+`} label="Research" />
        <Stat value={`${memberCount}+`} label="Members" />
        <Stat value={`${eventCount}+`} label="Events" />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {tickers.map((t) => (
          <span key={t.code} className="font-medium text-slate-600">
            {t.code}{" "}
            <span className={t.up ? "text-success" : "text-error"}>
              {t.price} {t.change}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-lg font-bold text-navy">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
