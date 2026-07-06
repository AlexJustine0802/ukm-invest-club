import Image from "next/image";
import Link from "next/link";
import { formatDate, isUpcoming } from "@/lib/utils";

interface EventCardProps {
  event: {
    slug: string;
    title: string;
    description: string;
    eventDate: Date;
    location: string | null;
    coverImage: string | null;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const upcoming = isUpcoming(event.eventDate);
  return (
    <Link href={`/events/${event.slug}`} className="card group flex flex-col">
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        {event.coverImage ? (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <span className="text-4xl">📅</span>
          </div>
        )}
        <span
          className={`badge absolute left-3 top-3 ${
            upcoming
              ? "bg-emerald text-white"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {upcoming ? "Upcoming" : "Past"}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-medium text-gold-dark">
          {formatDate(event.eventDate)}
        </p>
        <h3 className="mt-1 text-lg font-bold text-navy group-hover:text-gold-dark">
          {event.title}
        </h3>
        {event.location && (
          <p className="mt-1 text-sm text-slate-500">📍 {event.location}</p>
        )}
        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {event.description.replace(/[#*_>`]/g, "")}
        </p>
      </div>
    </Link>
  );
}
