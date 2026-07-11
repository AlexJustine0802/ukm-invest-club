import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteMoment } from "./actions";

export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export default async function AdminCommunityPage() {
  const moments = await prisma.moment.findMany({
    include: { _count: { select: { photos: true } } },
    orderBy: [{ order: "asc" }, { date: "desc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Community Moments</h1>
        <Link href="/admin/community/new" className="btn-primary">
          + Add moment
        </Link>
      </div>

      {moments.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No moments yet.{" "}
          <Link
            href="/admin/community/new"
            className="text-gold-dark underline"
          >
            Add one
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {moments.map((m) => (
            <div key={m.id} className="card overflow-hidden">
              <div className="aspect-video bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.coverImage}
                  alt={m.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-gold-dark">
                  {m.category}
                </span>
                <p className="font-semibold text-navy">{m.title}</p>
                <p className="text-sm text-slate-500">
                  {dateFormatter.format(m.date)}
                </p>
                <p className="text-xs text-slate-400">
                  Order: {m.order} · {m._count.photos} extra photo
                  {m._count.photos === 1 ? "" : "s"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/admin/community/${m.id}/edit`}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    Edit
                  </Link>
                  <DeleteButton
                    action={deleteMoment}
                    id={m.id}
                    className="btn-danger px-3 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
