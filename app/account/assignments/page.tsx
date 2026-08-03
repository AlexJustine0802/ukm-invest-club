import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ClipboardList,
  Clock,
  CalendarClock,
  CheckCircle2,
  CalendarDays,
  ChevronRight,
  SearchX,
} from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import InlineSearch from "@/components/account/InlineSearch";
import TabBar from "@/components/account/TabBar";
import MarkSeen from "@/components/account/MarkSeen";
import { getUiIcon } from "@/lib/uiIcons";
import {
  ASSIGNMENT_TABS,
  assignmentKey,
  dueLabel,
  isDueSoon,
  isOpen,
  isValidTab,
  memberState,
  type AssignmentTab,
} from "@/lib/assignments";

export const metadata: Metadata = { title: "Assignments" };
export const dynamic = "force-dynamic";

export default async function AssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const { tab: tabParam, q = "" } = await searchParams;
  const tab: AssignmentTab = isValidTab(tabParam) ? tabParam : "all";
  const query = q.trim().toLowerCase();

  const [all, submissions, seenRows] = await Promise.all([
    prisma.assignment.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { dueDate: "asc" }],
    }),
    prisma.assignmentSubmission.findMany({
      where: { userId: user.id },
      select: { assignmentId: true, gradedAt: true, score: true },
    }),
    // Shared with the bell: the same key marks a notification read and an
    // assignment seen, so clearing one clears the other.
    prisma.notificationRead.findMany({
      where: { userId: user.id },
      select: { key: true },
    }),
  ]);

  const seen = new Set(seenRows.map((r) => r.key));

  const mySubmissions = new Map(submissions.map((s) => [s.assignmentId, s]));

  const now = new Date();

  // Per member, not the shared column  see memberState in lib/assignments.
  const stateOf = (a: (typeof all)[number]) =>
    memberState(a.opensAt, mySubmissions.get(a.id), now);

  const counts = {
    active: all.filter((a) => stateOf(a) === "ACTIVE").length,
    dueSoon: all.filter((a) => isDueSoon(a.dueDate, stateOf(a), now)).length,
    comingSoon: all.filter((a) => stateOf(a) === "UPCOMING").length,
    completed: all.filter((a) => stateOf(a) === "COMPLETED").length,
  };

  /** Which bucket an assignment belongs to, for both filtering and counting. */
  const inBucket = (a: (typeof all)[number], id: AssignmentTab) => {
    switch (id) {
      case "active":
        return stateOf(a) === "ACTIVE";
      case "due-soon":
        return isDueSoon(a.dueDate, stateOf(a), now);
      case "coming-soon":
        return stateOf(a) === "UPCOMING";
      case "completed":
        return stateOf(a) === "COMPLETED";
      default:
        return true;
    }
  };

  const byTab = (a: (typeof all)[number]) => inBucket(a, tab);

  /**
   * Tab pills count what the member has not looked at yet, not the bucket size
   *  so a number appearing means "something new in here", and it clears once
   * they open that tab. The stat cards above still show the totals.
   */
  const unseenIn = (id: AssignmentTab) =>
    all.filter((a) => inBucket(a, id) && !seen.has(assignmentKey(a.id))).length;

  const visible = all.filter(
    (a) =>
      byTab(a) &&
      (!query ||
        a.title.toLowerCase().includes(query) ||
        (a.description ?? "").toLowerCase().includes(query)),
  );

  const tabCount: Record<AssignmentTab, number | null> = {
    all: null,
    active: unseenIn("active"),
    "due-soon": unseenIn("due-soon"),
    "coming-soon": unseenIn("coming-soon"),
    completed: unseenIn("completed"),
  };

  /**
   * Only a specific tab clears its own badge. Landing on "All Assignments"
   * would otherwise wipe every count before the member had looked at anything.
   */
  const seenNow =
    tab === "all"
      ? []
      : visible
          .filter((a) => !seen.has(assignmentKey(a.id)))
          .map((a) => assignmentKey(a.id));

  const tabHref = (id: AssignmentTab) => {
    const params = new URLSearchParams();
    if (id !== "all") params.set("tab", id);
    if (query) params.set("q", q.trim());
    const qs = params.toString();
    return qs ? `/account/assignments?${qs}` : "/account/assignments";
  };

  const stats = [
    { value: counts.active, label: "Active Assignments", note: "Currently ongoing", icon: ClipboardList, color: "bg-blue-50 text-primary" },
    { value: counts.dueSoon, label: "Due Soon", note: "Next 3 days", icon: Clock, color: "bg-amber-50 text-amber-600" },
    { value: counts.comingSoon, label: "Coming Soon", note: "Not open yet", icon: CalendarClock, color: "bg-violet-50 text-violet-600" },
    { value: counts.completed, label: "Completed", note: "Great job!", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
  ];

  const listHeading =
    ASSIGNMENT_TABS.find((t) => t.id === tab)?.label ?? "All Assignments";

  return (
    <>
      <AccountTopBar
        title="Assignments"
        subtitle="Track your tasks, submit your work, and stay on top of your deadlines."
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      {/* Opening a tab counts as reading what is in it. */}
      <MarkSeen keys={seenNow} />

      {/* Tabs  the underline slides between them, see TabBar. */}
      <div className="mt-8">
        <TabBar
          layoutId="assignment-tabs"
          active={tab}
          accent={["due-soon"]}
          tabs={ASSIGNMENT_TABS.map((t) => ({
            id: t.id,
            label: t.label,
            href: tabHref(t.id),
            count: tabCount[t.id],
          }))}
        />
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-4">
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold leading-tight text-navy">
                  {s.value}
                </p>
                <p className="text-sm font-medium text-navy">{s.label}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-400">{s.note}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="mt-8 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-navy">{listHeading}</h2>
        <InlineSearch placeholder="Search assignments..." />
      </div>

      {visible.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16">
          <SearchX className="h-10 w-10 text-slate-300" />
          <p className="font-semibold text-navy">No assignments here</p>
          <p className="text-sm text-slate-500">
            {all.length === 0
              ? "No assignments have been posted yet."
              : "Nothing matches this tab or search."}
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {visible.map((a) => {
            const soon = isDueSoon(a.dueDate, stateOf(a), now);
            const mine = mySubmissions.get(a.id);
            // What this member did with it beats the assignment's own status.
            // Marking is feedback on a completed assignment, not a state of its
            // own  it only changes what the badge says.
            const badge = mine?.gradedAt
              ? {
                  text:
                    mine.score !== null
                      ? `Completed · ${mine.score}`
                      : "Completed · marked",
                  cls: "bg-blue-50 text-primary",
                }
              : mine
                ? { text: "Completed", cls: "bg-emerald-50 text-emerald-600" }
                : !isOpen(a.opensAt, now)
                  ? { text: "Coming soon", cls: "bg-violet-50 text-violet-600" }
                  : soon
                    ? { text: "Due Soon", cls: "bg-amber-50 text-amber-600" }
                    : { text: "Active", cls: "bg-emerald-50 text-emerald-600" };

            return (
              <Link
                key={a.id}
                href={`/account/assignments/${a.id}`}
                className="flex flex-col gap-4 p-5 hover:bg-slate-50 lg:flex-row lg:items-center"
              >
                {/* One icon for every assignment  there is nothing to pick. */}
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
                  <ClipboardList className="h-6 w-6" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-bold text-navy">{a.title}</p>
                  {a.description && (
                    <p className="mt-1 text-sm text-slate-500">{a.description}</p>
                  )}
                </div>

                <div className="shrink-0 lg:w-48">
                  <p
                    className={`text-sm font-semibold ${
                      soon ? "text-red-600" : "text-navy"
                    }`}
                  >
                    {dueLabel(a.dueDate, now)}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {a.dueDate.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    ,{" "}
                    {a.dueDate.toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <span className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${badge.cls}`}>
                    {badge.text}
                  </span>
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
