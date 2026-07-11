import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import EventForm from "@/components/admin/EventForm";
import { updateEvent } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, categories] = await Promise.all([
    prisma.event.findUnique({ where: { id } }),
    prisma.eventCategory.findMany({
      orderBy: { order: "asc" },
      select: { id: true, title: true },
    }),
  ]);
  if (!event) notFound();

  return (
    <div>
      <Link
        href="/admin/events"
        className="text-sm text-gold-dark hover:text-gold"
      >
        ← Back to events
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit event</h1>
      <div className="mt-6 max-w-2xl">
        <EventForm
          action={updateEvent}
          uploadEnabled={isBlobConfigured()}
          categories={categories}
          event={event}
        />
      </div>
    </div>
  );
}
