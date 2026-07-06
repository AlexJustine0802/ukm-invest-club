import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import EventCard from "@/components/EventCard";
import PublicationCard from "@/components/PublicationCard";

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

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-emerald blur-3xl" />
        </div>
        <div className="container-page relative py-24 sm:py-32">
          <div className="max-w-2xl animate-fade-up">
            <span className="badge bg-gold/20 text-gold">
              {site.fullName}
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              Learn. Invest. <span className="text-gold">Grow together.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              {site.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/events" className="btn-primary">
                Explore events
              </Link>
              <Link href="/about" className="btn-secondary bg-white/10 text-white border-white/20 hover:bg-white/20">
                About us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-100 bg-white">
        <div className="container-page grid grid-cols-3 gap-4 py-10 text-center">
          {[
            { label: "Events hosted", value: eventCount },
            { label: "Publications", value: pubCount },
            { label: "Committee members", value: memberCount },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-extrabold text-navy sm:text-4xl">
                {stat.value}+
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured events */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-navy">
              {upcomingEvents.length > 0 ? "Upcoming events" : "Recent events"}
            </h2>
            <p className="mt-2 text-slate-600">
              Join our activities and grow your investing skills.
            </p>
          </div>
          <Link
            href="/events"
            className="hidden text-sm font-semibold text-gold-dark hover:text-gold sm:block"
          >
            View all →
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

      {/* Latest publications */}
      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-navy">
                Latest publications
              </h2>
              <p className="mt-2 text-slate-600">
                Research, insights, and learning resources from our members.
              </p>
            </div>
            <Link
              href="/publications"
              className="hidden text-sm font-semibold text-gold-dark hover:text-gold sm:block"
            >
              View all →
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

      {/* CTA */}
      <section className="container-page py-16">
        <div className="rounded-2xl bg-navy px-8 py-12 text-center text-white sm:px-16">
          <h2 className="text-3xl font-bold">Want to get involved?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Whether you&apos;re a complete beginner or an experienced investor,
            there&apos;s a place for you at {site.name}.
          </p>
          <Link href="/contact" className="btn-primary mt-6">
            Contact us
          </Link>
        </div>
      </section>
    </>
  );
}
