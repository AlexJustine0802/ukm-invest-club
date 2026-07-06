import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime, isUpcoming } from "@/lib/utils";
import Markdown from "@/components/Markdown";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getEvent(slug: string) {
  return prisma.event.findFirst({ where: { slug, published: true } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.description.slice(0, 155),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const upcoming = isUpcoming(event.eventDate);

  return (
    <article>
      {event.coverImage && (
        <div className="relative h-72 w-full bg-navy sm:h-96">
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover opacity-90"
            priority
          />
        </div>
      )}
      <div className="container-page py-12">
        <Link
          href="/events"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          ← Back to events
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span
            className={`badge ${
              upcoming ? "bg-success text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            {upcoming ? "Upcoming" : "Past event"}
          </span>
          <span className="text-sm text-slate-500">
            {formatDateTime(event.eventDate)}
          </span>
        </div>

        <h1 className="mt-3 text-4xl font-extrabold text-navy">
          {event.title}
        </h1>
        {event.location && (
          <p className="mt-2 text-slate-600">📍 {event.location}</p>
        )}

        <div className="mt-8 max-w-3xl">
          <Markdown content={event.description} />
        </div>
      </div>
    </article>
  );
}
