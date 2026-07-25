import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { getUiIcon } from "@/lib/uiIcons";
import { deleteDivision } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminDivisionsPage() {
  // People belong to a division through User.division, so the head count comes
  // from a groupBy rather than a relation.
  const [divisions, peopleByDivision] = await Promise.all([
    prisma.division.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] }),
    prisma.user.groupBy({
      by: ["division"],
      where: { division: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const countFor = (slug: string) =>
    peopleByDivision.find((g) => g.division === slug)?._count._all ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Divisions</h1>
          <p className="mt-1 text-sm text-slate-500">
            “Our Divisions” on the About page. This is the division’s own
            description and icon — its people come from Members, so a role
            change there updates the public site too.
          </p>
        </div>
        <Link href="/admin/divisions/new" className="btn-primary">
          + Add division
        </Link>
      </div>

      {divisions.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No divisions yet.{" "}
          <Link href="/admin/divisions/new" className="text-accent-dark underline">
            Add one
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {divisions.map((d) => {
            const Icon = getUiIcon(d.icon);
            const people = countFor(d.slug);
            return (
              <div key={d.id} className="card flex flex-wrap items-start gap-4 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-navy">{d.name}</p>
                  {d.tagline && (
                    <p className="text-sm text-slate-500">{d.tagline}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {people} member{people === 1 ? "" : "s"} · Order: {d.order}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/divisions/${d.id}/edit`}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    Edit
                  </Link>
                  <DeleteButton
                    action={deleteDivision}
                    id={d.id}
                    className="btn-danger px-3 py-1.5 text-xs"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
