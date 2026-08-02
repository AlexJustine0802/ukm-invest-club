import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { sectionConfig } from "@/lib/dashboardSections";
import { deleteDashboardItem } from "./actions";
import Can from "@/components/admin/Can";
import { requireView } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function AdminDashboardContentPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  await requireView("dashboard-content");

  const { section: sectionParam } = await searchParams;
  const config = sectionConfig(sectionParam);
  const section = config.id;

  const items = await prisma.dashboardItem.findMany({
    where: { section },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { materials: true } } },
  });

  const newHref = `/admin/dashboard-content/new?section=${section}`;

  return (
    <div>
      {/* The section tabs used to live here; the shortcut cards on the member
          dashboard admin page are the way in, so this is the way back. */}
      <Link
        href="/admin/member-dashboard"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to admin menu
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">{config.label}</h1>
          <p className="mt-1 text-sm text-slate-500">{config.description}</p>
        </div>
        <Can module="dashboard-content" action="create">
          <Link href={newHref} className="btn-primary">
            + Add item
          </Link>
        </Can>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-slate-500">
          Nothing here yet.{" "}
          <Can module="dashboard-content" action="create">
            <Link href={newHref} className="text-accent-dark underline">
              Add one
            </Link>
          </Can>
          . While this section is empty it is hidden on the dashboard.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="card flex flex-wrap items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-navy">{item.title}</p>
                  {item.badge && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      {item.badge}
                    </span>
                  )}
                  {!item.active && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                      Hidden
                    </span>
                  )}
                </div>
                {item.subtitle && (
                  <p className="mt-0.5 text-sm text-slate-600">{item.subtitle}</p>
                )}
                {section === "folder" ? (
                  <p className="text-xs text-slate-400">
                    {item._count.materials} material
                    {item._count.materials === 1 ? "" : "s"}
                  </p>
                ) : (
                  item.meta && (
                    <p className="text-xs text-slate-400">{item.meta}</p>
                  )
                )}
                <p className="mt-1 text-xs text-slate-400">
                  Order: {item.order}
                  {item.note ? ` · ${item.note}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {section === "folder" && (
                  <Can module="resource-materials" action="view">
                    <Link
                      href={`/admin/dashboard-content/${item.id}/materials`}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Materials
                    </Link>
                  </Can>
                )}
                <Can module="dashboard-content" action="edit">
                  <Link
                    href={`/admin/dashboard-content/${item.id}/edit`}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    Edit
                  </Link>
                </Can>
                <Can module="dashboard-content" action="delete">
                  <DeleteButton
                    action={deleteDashboardItem}
                    id={item.id}
                    className="btn-danger px-3 py-1.5 text-xs"
                  />
                </Can>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
