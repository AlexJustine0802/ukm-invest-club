import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, isUpcoming } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteEvent } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    include: { category: true },
    orderBy: { eventDate: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Events</h1>
        <Link href="/admin/events/new" className="btn-primary">
          + New event
        </Link>
      </div>

      {events.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No events yet.{" "}
          <Link href="/admin/events/new" className="text-accent-dark underline">
            Create your first event
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{event.title}</p>
                    {event.location && (
                      <p className="text-xs text-slate-400">{event.location}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {event.category?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(event.eventDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`badge w-fit ${
                          isUpcoming(event.eventDate)
                            ? "bg-emerald/10 text-emerald"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isUpcoming(event.eventDate) ? "Upcoming" : "Past"}
                      </span>
                      {!event.published && (
                        <span className="badge w-fit bg-amber-100 text-amber-700">
                          Draft
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/events/${event.id}/edit`}
                        className="btn-secondary px-3 py-1.5 text-xs"
                      >
                        Edit
                      </Link>
                      <DeleteButton
                        action={deleteEvent}
                        id={event.id}
                        className="btn-danger px-3 py-1.5 text-xs"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
