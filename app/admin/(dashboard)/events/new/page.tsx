import Link from "next/link";
import { isBlobConfigured } from "@/lib/upload";
import EventForm from "@/components/admin/EventForm";
import { createEvent } from "../actions";

export default function NewEventPage() {
  return (
    <div>
      <Link
        href="/admin/events"
        className="text-sm text-gold-dark hover:text-gold"
      >
        ← Back to events
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">New event</h1>
      <div className="mt-6 max-w-2xl">
        <EventForm action={createEvent} uploadEnabled={isBlobConfigured()} />
      </div>
    </div>
  );
}
