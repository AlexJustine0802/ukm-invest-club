import Link from "next/link";
import EventCategoryForm from "@/components/admin/EventCategoryForm";
import { createEventCategory } from "../actions";

export default function NewEventCategoryPage() {
  return (
    <div>
      <Link
        href="/admin/event-categories"
        className="text-sm text-gold-dark hover:text-gold"
      >
        ← Back to event categories
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">
        Add event category
      </h1>
      <div className="mt-6 max-w-2xl">
        <EventCategoryForm action={createEventCategory} />
      </div>
    </div>
  );
}
