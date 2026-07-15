import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import FeaturedSelectForm from "@/components/admin/FeaturedSelectForm";
import { setFeaturedEvents } from "./actions";

export const dynamic = "force-dynamic";

export default async function EventsHeroPage() {
  const events = await prisma.event.findMany({
    where: { published: true },
    orderBy: { eventDate: "desc" },
    select: { id: true, title: true, featured: true, eventDate: true },
  });

  const items = events.map((e) => ({
    id: e.id,
    label: e.title,
    sub: formatDate(e.eventDate),
    checked: e.featured,
  }));

  return (
    <div>
      <Link
        href="/admin/events"
        className="text-sm text-gold-dark hover:text-gold"
      >
        ← Back to events
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Events Hero</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tick the events to show in the Events page hero slider. If none are
        ticked, upcoming events are shown.
      </p>
      <div className="max-w-2xl">
        <FeaturedSelectForm
          action={setFeaturedEvents}
          items={items}
          emptyText="No published events yet."
        />
      </div>
    </div>
  );
}
