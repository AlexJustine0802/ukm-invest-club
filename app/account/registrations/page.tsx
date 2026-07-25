import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  CalendarClock,
  Users,
  Check,
  SearchX,
  ClipboardList,
} from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import InlineSearch from "@/components/account/InlineSearch";
import { getUiIcon } from "@/lib/uiIcons";
import { eventPalette } from "@/lib/eventStyles";
import { formStatus, parseQuestions, allowsMembers } from "@/lib/forms";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Registration" };
export const dynamic = "force-dynamic";

const tabs = [
  { id: "open", label: "Open" },
  { id: "mine", label: "My Registrations" },
  { id: "all", label: "All" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  const { tab: tabParam, q = "" } = await searchParams;
  const tab: TabId = tabs.some((t) => t.id === tabParam)
    ? (tabParam as TabId)
    : "open";
  const query = q.trim().toLowerCase();

  const [forms, myResponses] = await Promise.all([
    prisma.registrationForm.findMany({
      // Event sign-ups are reached from the event, recruitment from its own
      // page — this lists whatever is left.
      where: { published: true, events: { none: {} }, isRecruitment: false },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { responses: true } } },
    }),
    prisma.formResponse.findMany({
      where: { userId: user.id },
      select: { formId: true, createdAt: true },
    }),
  ]);

  const submittedAt = new Map(myResponses.map((r) => [r.formId, r.createdAt]));
  const now = new Date();

  // Forms aimed only at outsiders never show in the member area.
  const forMembers = forms.filter((f) => allowsMembers(f.audience));

  const matches = (f: (typeof forms)[number]) =>
    !query ||
    f.title.toLowerCase().includes(query) ||
    (f.description ?? "").toLowerCase().includes(query);

  const visible = forMembers.filter((f) => {
    if (!matches(f)) return false;
    if (tab === "mine") return submittedAt.has(f.id);
    if (tab === "open") return formStatus(f, now) === "open";
    return true;
  });

  const hrefWith = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    if (tab !== "open") params.set("tab", tab);
    if (query) params.set("q", q.trim());
    for (const [key, value] of Object.entries(patch)) params.set(key, value);
    if (params.get("tab") === "open") params.delete("tab");
    const qs = params.toString();
    return qs ? `/account/registrations?${qs}` : "/account/registrations";
  };

  return (
    <>
      <AccountTopBar
        title="Registration"
        subtitle="Open recruitment and event sign-up forms."
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      <div className="mt-8 flex flex-wrap items-center gap-6 border-b border-slate-200">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={hrefWith({ tab: t.id })}
            className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-sm font-semibold ${
              t.id === tab
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-navy"
            }`}
          >
            {t.label}
            {t.id === "mine" && submittedAt.size > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
                {submittedAt.size}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end">
        <InlineSearch placeholder="Search registrations..." />
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16">
          <SearchX className="h-10 w-10 text-slate-300" />
          <p className="font-semibold text-navy">
            {tab === "mine" ? "You haven't registered for anything yet" : "Nothing open right now"}
          </p>
          <p className="text-sm text-slate-500">
            {tab === "mine"
              ? "Forms you submit will be listed here."
              : "New recruitment and sign-up forms will appear here."}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {visible.map((f) => {
            const Icon = getUiIcon(f.icon ?? "ClipboardList");
            const palette = eventPalette(f.color, f.title);
            const status = formStatus(f, now);
            const done = submittedAt.get(f.id);
            const full =
              f.capacity !== null && f._count.responses >= f.capacity;
            const questionCount = parseQuestions(f.questions).length;

            return (
              <article
                key={f.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 lg:flex-row lg:items-center"
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${palette.badge}`}
                >
                  <Icon className="h-6 w-6" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-navy">{f.title}</h2>
                    {status === "closed" && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                        Closed
                      </span>
                    )}
                    {status === "not-yet" && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        Opens soon
                      </span>
                    )}
                    {done && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <Check className="h-3 w-3" />
                        Submitted
                      </span>
                    )}
                  </div>
                  {f.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {f.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <ClipboardList className="h-3.5 w-3.5 text-slate-400" />
                      {questionCount} question{questionCount === 1 ? "" : "s"}
                    </span>
                    {f.closesAt && (
                      <span className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
                        Closes {formatDateTime(f.closesAt)}
                      </span>
                    )}
                    {f.capacity !== null && (
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        {f._count.responses} / {f.capacity} filled
                      </span>
                    )}
                    {done && (
                      <span className="text-emerald-700">
                        Sent {formatDateTime(done)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 lg:w-44">
                  {status === "open" && (!full || done) ? (
                    <Link
                      href={`/register/${f.slug}`}
                      className="block w-full rounded-lg bg-primary px-6 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-dark"
                    >
                      {done ? "View my answers" : "Register"}
                    </Link>
                  ) : done ? (
                    <Link
                      href={`/register/${f.slug}`}
                      className="block w-full rounded-lg bg-emerald-50 px-6 py-2.5 text-center text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      View my answers
                    </Link>
                  ) : (
                    <span className="block w-full rounded-lg bg-slate-100 px-6 py-2.5 text-center text-sm font-semibold text-slate-400">
                      {full ? "Full" : status === "not-yet" ? "Not open" : "Closed"}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
