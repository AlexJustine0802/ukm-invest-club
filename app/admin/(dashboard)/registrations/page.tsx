import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { getUiIcon } from "@/lib/uiIcons";
import { eventPalette } from "@/lib/eventStyles";
import { formStatus, parseQuestions, AUDIENCES } from "@/lib/forms";
import { formatDateTime } from "@/lib/utils";
import { deleteRegistrationForm } from "./actions";
import Can from "@/components/admin/Can";
import { requireView } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-emerald-50 text-emerald-700" },
  closed: { label: "Closed", className: "bg-slate-100 text-slate-400" },
  "not-yet": { label: "Opens soon", className: "bg-amber-50 text-amber-700" },
  hidden: { label: "Hidden", className: "bg-slate-100 text-slate-400" },
};

const TABS = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "not-yet", label: "Opens soon" },
  { id: "closed", label: "Closed" },
  { id: "hidden", label: "Hidden" },
  { id: "recruitment", label: "Recruitment" },
  { id: "event", label: "Event forms" },
  { id: "standalone", label: "Standalone" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default async function AdminRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  await requireView("registrations");

  const { tab: tabParam, q = "" } = await searchParams;
  const tab: TabId = TABS.some((t) => t.id === tabParam)
    ? (tabParam as TabId)
    : "all";
  const query = q.trim().toLowerCase();

  const all = await prisma.registrationForm.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: {
      _count: { select: { responses: true } },
      event: { select: { title: true } },
    },
  });
  const now = new Date();

  const matchesTab = (f: (typeof all)[number], id: TabId) => {
    switch (id) {
      case "open":
      case "not-yet":
      case "closed":
      case "hidden":
        return formStatus(f, now) === id;
      case "recruitment":
        return f.isRecruitment;
      case "event":
        return f.event !== null;
      case "standalone":
        return !f.isRecruitment && f.event === null;
      default:
        return true;
    }
  };

  const matchesQuery = (f: (typeof all)[number]) =>
    !query ||
    f.title.toLowerCase().includes(query) ||
    f.slug.toLowerCase().includes(query) ||
    (f.description ?? "").toLowerCase().includes(query);

  const forms = all.filter((f) => matchesTab(f, tab) && matchesQuery(f));

  const tabHref = (id: TabId) => {
    const params = new URLSearchParams();
    if (id !== "all") params.set("tab", id);
    if (query) params.set("q", q.trim());
    const qs = params.toString();
    return qs ? `/admin/registrations?${qs}` : "/admin/registrations";
  };

  return (
    <div>
      <Link
        href="/admin/member-dashboard"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to member dashboard
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Registrations</h1>
        </div>
        <Can module="registrations" action="create">
          <Link href="/admin/registrations/new" className="btn-primary">
            + New form
          </Link>
        </Can>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {TABS.map((t) => {
          const count = all.filter((f) => matchesTab(f, t.id)).length;
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
          placeholder="Search title, slug or description..."
          className="input max-w-xs"
        />
        <button type="submit" className="btn-secondary">
          Search
        </button>
        {(query || tab !== "all") && (
          <Link href="/admin/registrations" className="text-xs text-slate-500 underline">
            Reset
          </Link>
        )}
      </form>

      {forms.length === 0 ? (
        <p className="mt-8 text-slate-500">
          {all.length === 0 ? (
            <>
              No forms yet.{" "}
              <Can module="registrations" action="create">
                <Link href="/admin/registrations/new" className="text-accent-dark underline">
                  Create one
                </Link>
              </Can>
              .
            </>
          ) : (
            "No forms match this filter."
          )}
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {forms.map((f) => {
            const Icon = getUiIcon(f.icon ?? "ClipboardList");
            const palette = eventPalette(f.color, f.title);
            const badge = STATUS_BADGE[formStatus(f, now)];
            const audience = AUDIENCES.find((a) => a.id === f.audience);
            const questionCount = parseQuestions(f.questions).length;

            return (
              <div key={f.id} className="card flex flex-wrap items-start gap-4 p-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${palette.badge}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-navy">{f.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      {audience?.label ?? f.audience}
                    </span>
                    {f.isRecruitment && (
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-primary-dark">
                        Recruitment
                      </span>
                    )}
                    {f.event && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-primary">
                        Event: {f.event.title}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    /register/{f.slug} · {questionCount} question
                    {questionCount === 1 ? "" : "s"} ·{" "}
                    {f._count.responses} response
                    {f._count.responses === 1 ? "" : "s"}
                    {f.capacity !== null ? ` / ${f.capacity}` : ""}
                    {f.closesAt ? ` · closes ${formatDateTime(f.closesAt)}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/admin/registrations/${f.id}/responses`}
                    className="btn-primary px-3 py-1.5 text-xs"
                  >
                    Responses ({f._count.responses})
                  </Link>
                  <Link
                    href={`/register/${f.slug}`}
                    target="_blank"
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    Open link
                  </Link>
                  <Can module="registrations" action="edit">
                    <Link
                      href={`/admin/registrations/${f.id}/edit`}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Edit
                    </Link>
                  </Can>
                  <Can module="registrations" action="delete">
                    <DeleteButton
                      action={deleteRegistrationForm}
                      id={f.id}
                      className="btn-danger px-3 py-1.5 text-xs"
                      confirmMessage="Delete this form? Every submitted response goes with it. This cannot be undone."
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
