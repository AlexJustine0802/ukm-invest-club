import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { getUiIcon } from "@/lib/uiIcons";
import { deleteImpactStat } from "./actions";
import Can from "@/components/admin/Can";
import { requireView } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function AdminImpactStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  await requireView("impact-stats");

  const { section: sectionParam } = await searchParams;
  const section = sectionParam === "research" ? "research" : "home";
  const isResearch = section === "research";

  const stats = await prisma.impactStat.findMany({
    where: { section },
    orderBy: [{ order: "asc" }],
  });

  const newHref = `/admin/impact-stats/new?section=${section}`;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">
            {isResearch ? "Research Stats" : "Impact Stats"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isResearch
              ? "“Research By The Numbers” section on the Research page."
              : "“Our Impact” section on both Home and About."}
          </p>
        </div>
        <Can module="impact-stats" action="create">
          <Link href={newHref} className="btn-primary">
            + Add stat
          </Link>
        </Can>
      </div>

      <div className="mt-4 flex gap-2">
        <Link
          href="/admin/impact-stats"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            !isResearch ? "bg-navy text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          Home / About
        </Link>
        <Link
          href="/admin/impact-stats?section=research"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            isResearch ? "bg-navy text-white" : "bg-slate-100 text-slate-600"
          }`}
        >
          Research
        </Link>
      </div>

      {stats.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No stats yet.{" "}
          <Can module="impact-stats" action="create">
            <Link href={newHref} className="text-accent-dark underline">
              Add one
            </Link>
          </Can>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = getUiIcon(stat.icon);
            return (
              <div key={stat.id} className="card p-5">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-2xl font-extrabold text-navy">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1 text-xs text-slate-400">Order: {stat.order}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Can module="impact-stats" action="edit">
                    <Link
                      href={`/admin/impact-stats/${stat.id}/edit`}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Edit
                    </Link>
                  </Can>
                  <Can module="impact-stats" action="delete">
                    <DeleteButton
                      action={deleteImpactStat}
                      id={stat.id}
                      className="btn-danger px-3 py-1.5 text-xs"
                    />
                  </Can>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
