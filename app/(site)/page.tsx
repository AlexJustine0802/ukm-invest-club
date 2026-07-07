import Link from "next/link";
import { ArrowRight, Users, FileText, CalendarDays, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import EventCard from "@/components/EventCard";
import HeroCarousel from "@/components/HeroCarousel";
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
      <HeroCarousel />

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

      <PartnerStrip />
    </>
  );
}
