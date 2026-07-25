import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteHighlight } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminHighlightsPage() {
  const highlights = await prisma.highlight.findMany({
    orderBy: [{ active: "desc" }, { createdAt: "desc" }],
  });

  // Mirrors the dashboard: newest active row wins.
  const shownId = highlights.find((h) => h.active)?.id;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Highlights</h1>
          <p className="mt-1 text-sm text-slate-500">
            Promo banner at the top of the member dashboard — use it for staff
            recruitment, competitions, or any announcement worth featuring.
          </p>
        </div>
        <Link href="/admin/highlights/new" className="btn-primary">
          + Add highlight
        </Link>
      </div>

      {highlights.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No highlights yet.{" "}
          <Link href="/admin/highlights/new" className="text-accent-dark underline">
            Add one
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {highlights.map((h) => (
            <div key={h.id} className="card flex flex-wrap items-start gap-4 p-5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    {h.eyebrow}
                  </p>
                  {h.id === shownId ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                      Showing now
                    </span>
                  ) : h.active ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="mt-1 font-bold text-navy">{h.title}</p>
                {h.description && (
                  <p className="mt-1 text-sm text-slate-500">{h.description}</p>
                )}
                {h.buttonLabel && (
                  <p className="mt-2 text-xs text-slate-400">
                    Button: {h.buttonLabel} → {h.buttonHref || "(no link)"}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/highlights/${h.id}/edit`}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Edit
                </Link>
                <DeleteButton
                  action={deleteHighlight}
                  id={h.id}
                  className="btn-danger px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
