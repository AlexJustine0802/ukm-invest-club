import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DASHBOARD_SECTIONS } from "@/lib/dashboardSections";

export const dynamic = "force-dynamic";

export default async function MemberDashboardHomePage() {
  const [counts, highlight, members] = await Promise.all([
    prisma.dashboardItem.groupBy({
      by: ["section"],
      _count: { _all: true },
      where: { active: true },
    }),
    prisma.highlight.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  const countOf = (section: string) =>
    counts.find((c) => c.section === section)?._count._all ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Member Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Everything behind the member login at <code>/account</code>.
      </p>

      {/* Snapshot */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-2xl font-extrabold text-navy">{members}</p>
          <p className="text-sm text-slate-500">Registered members</p>
        </div>
        <div className="card p-5">
          <p className="text-2xl font-extrabold text-navy">
            {highlight ? "Live" : "None"}
          </p>
          <p className="text-sm text-slate-500">Dashboard highlight</p>
          <Link
            href="/admin/highlights"
            className="mt-2 inline-block text-xs font-semibold text-accent-dark underline"
          >
            {highlight ? highlight.title : "Add one"}
          </Link>
        </div>
        <div className="card p-5">
          <p className="text-2xl font-extrabold text-navy">
            {counts.reduce((sum, c) => sum + c._count._all, 0)}
          </p>
          <p className="text-sm text-slate-500">Active content items</p>
        </div>
      </div>

      {/* Section shortcuts */}
      <h2 className="mt-10 text-lg font-bold text-navy">Dashboard content</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD_SECTIONS.map((s) => (
          <Link
            key={s.id}
            href={`/admin/dashboard-content?section=${s.id}`}
            className="card p-5 transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="font-bold text-navy">{s.label}</p>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {countOf(s.id)}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
