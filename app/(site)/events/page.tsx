import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import EventCard from "@/components/EventCard";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description: "Upcoming and past events hosted by ICUnpar.",
};

export default async function EventsPage() {
  const now = new Date();
  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: { published: true, eventDate: { gte: now } },
      orderBy: { eventDate: "asc" },
    }),
    prisma.event.findMany({
      where: { published: true, eventDate: { lt: now } },
      orderBy: { eventDate: "desc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Events"
        subtitle="Workshops, talks, and community activities to sharpen your investing skills."
      />
      <div className="container-page py-12">
        <section>
          <h2 className="text-2xl font-bold text-navy">Upcoming</h2>
          {upcoming.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-slate-500">
              No upcoming events right now — check back soon!
            </p>
          )}
        </section>

        {past.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-navy">Past events</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
