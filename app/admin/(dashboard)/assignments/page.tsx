import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { getUiIcon } from "@/lib/uiIcons";
import { dueLabel, isDueSoon } from "@/lib/assignments";
import { deleteAssignment } from "./actions";
import Can from "@/components/admin/Can";
import { requireView } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

// Same buckets the members see, plus "Hidden" which only exists in the admin.
const TABS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "due-soon", label: "Due Soon" },
  { id: "submitted", label: "Submitted" },
  { id: "completed", label: "Completed" },
  { id: "hidden", label: "Hidden" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function AdminAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  await requireView("assignments");

  const { tab: tabParam, q = "" } = await searchParams;
  const tab: TabId = TABS.some((t) => t.id === tabParam)
    ? (tabParam as TabId)
    : "all";
  const query = q.trim().toLowerCase();

  const all = await prisma.assignment.findMany({
    orderBy: [{ order: "asc" }, { dueDate: "asc" }],
    include: { _count: { select: { submissions: true } } },
  });
  const now = new Date();

  const matchesTab = (a: (typeof all)[number], id: TabId) => {
    switch (id) {
      case "active":
        return a.published && a.status === "ACTIVE";
      case "due-soon":
        return a.published && isDueSoon(a.dueDate, a.status, now);
      case "submitted":
        return a.status === "SUBMITTED";
      case "completed":
        return a.status === "COMPLETED";
      case "hidden":
        return !a.published;
      default:
        return true;
    }
  };

  const matchesQuery = (a: (typeof all)[number]) =>
    !query ||
    a.title.toLowerCase().includes(query) ||
    a.category.toLowerCase().includes(query) ||
    a.workType.toLowerCase().includes(query);

  const assignments = all.filter((a) => matchesTab(a, tab) && matchesQuery(a));

  const tabHref = (id: TabId) => {
    const params = new URLSearchParams();
    if (id !== "all") params.set("tab", id);
    if (query) params.set("q", q.trim());
    const qs = params.toString();
    return qs ? `/admin/assignments?${qs}` : "/admin/assignments";
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Assignments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Shown on <code>/account/assignments</code>. Counts and the Due Soon
            tab are worked out from each due date.
          </p>
        </div>
        <Can module="assignments" action="create">
          <Link href="/admin/assignments/new" className="btn-primary">
            + Add assignment
          </Link>
        </Can>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const count = all.filter((a) => matchesTab(a, t.id)).length;
          return (
            <Link
              key={t.id}
              href={tabHref(t.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
                t.id === tab
                  ? "bg-navy text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label} ({count})
            </Link>
          );
        })}
      </div>

      <form method="get" className="mt-3 flex flex-wrap items-center gap-2">
        {tab !== "all" && <input type="hidden" name="tab" value={tab} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search title, category or work type..."
          className="input max-w-xs"
        />
        <button type="submit" className="btn-secondary">
          Search
        </button>
        {(query || tab !== "all") && (
          <Link href="/admin/assignments" className="text-xs text-slate-500 underline">
            Reset
          </Link>
        )}
      </form>

      {assignments.length === 0 ? (
        <p className="mt-8 text-slate-500">
          {all.length === 0 ? (
            <>
              No assignments yet.{" "}
              <Can module="assignments" action="create">
                <Link href="/admin/assignments/new" className="text-accent-dark underline">
                  Add one
                </Link>
              </Can>
              .
            </>
          ) : (
            "No assignments match this filter."
          )}
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {assignments.map((a) => {
            const Icon = getUiIcon(a.icon);
            const soon = isDueSoon(a.dueDate, a.status, now);
            return (
              <div key={a.id} className="card flex flex-wrap items-start gap-4 p-4">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${a.color ?? "bg-blue-50 text-primary"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-navy">{a.title}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      {a.status.charAt(0) + a.status.slice(1).toLowerCase()}
                    </span>
                    {soon && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                        Due soon
                      </span>
                    )}
                    {!a.published && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {a.category} • {a.workType}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {dueLabel(a.dueDate, now)} ·{" "}
                    {a.dueDate.toLocaleString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · Order: {a.order}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/assignments/${a.id}/submissions`}
                    className="btn-primary px-3 py-1.5 text-xs"
                  >
                    Submissions ({a._count.submissions})
                  </Link>
                  <Can module="assignments" action="edit">
                    <Link
                      href={`/admin/assignments/${a.id}/edit`}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Edit
                    </Link>
                  </Can>
                  <Can module="assignments" action="delete">
                    <DeleteButton
                      action={deleteAssignment}
                      id={a.id}
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
