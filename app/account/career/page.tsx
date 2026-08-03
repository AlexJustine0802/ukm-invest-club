import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, MapPin, Clock, SearchX, Sparkles } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import InlineSearch from "@/components/account/InlineSearch";
import CompanyLogo from "@/components/account/CompanyLogo";
import { eventPalette } from "@/lib/eventStyles";
import { isNewAlert, deadlineLabel, postedLabel } from "@/lib/career";

export const metadata: Metadata = { title: "Career Alert" };
export const dynamic = "force-dynamic";

export default async function CareerPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const { type: typeParam, q = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  const alerts = await prisma.careerAlert.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  const types = [...new Set(alerts.map((a) => a.workType))].sort();
  const type = typeParam && types.includes(typeParam) ? typeParam : "all";
  const now = new Date();

  const visible = alerts.filter(
    (a) =>
      (type === "all" || a.workType === type) &&
      (!query ||
        a.company.toLowerCase().includes(query) ||
        a.role.toLowerCase().includes(query) ||
        (a.location ?? "").toLowerCase().includes(query) ||
        (a.description ?? "").toLowerCase().includes(query)),
  );

  const hrefWith = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (query) params.set("q", q.trim());
    for (const [key, value] of Object.entries(patch)) params.set(key, value);
    if (params.get("type") === "all") params.delete("type");
    const qs = params.toString();
    return qs ? `/account/career?${qs}` : "/account/career";
  };

  return (
    <>
      <AccountTopBar
        title="Career Alert"
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      <div className="mt-8 flex items-center gap-3">
        <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:thin]">
          <div className="flex w-max items-center gap-3 pb-1">
            {[{ id: "all", label: "All" }, ...types.map((t) => ({ id: t, label: t }))].map(
              (t) => (
                <Link
                  key={t.id}
                  href={hrefWith({ type: t.id })}
                  className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold ${
                    t.id === type
                      ? "bg-primary text-white"
                      : "border border-slate-200 bg-white text-navy hover:bg-slate-50"
                  }`}
                >
                  {t.label}
                </Link>
              ),
            )}
          </div>
        </div>
        <div className="shrink-0">
          <InlineSearch placeholder="Search jobs..." />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16">
          <SearchX className="h-10 w-10 text-slate-300" />
          <p className="font-semibold text-navy">No openings right now</p>
          <p className="text-sm text-slate-500">
            New opportunities show up here and in your notifications.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((a) => {
            const palette = eventPalette(a.color, a.company);
            const closed = a.deadline !== null && a.deadline < now;

            return (
              <Link
                key={a.id}
                href={`/account/career/${a.id}`}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-primary/60 hover:bg-blue-50/20"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-bold leading-snug text-navy underline-offset-2 group-hover:underline">
                      {a.role}
                    </h2>
                    <p className="mt-0.5 flex items-center gap-2 text-sm text-slate-600">
                      <Briefcase className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{a.company}</span>
                    </p>
                  </div>
                  <CompanyLogo
                    logo={a.logo}
                    company={a.company}
                    className="h-11 w-11"
                    fallbackClassName={palette.badge}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold ${palette.badge}`}
                  >
                    {a.workType}
                  </span>
                  {isNewAlert(a.createdAt, now) && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                      <Sparkles className="h-3 w-3" />
                      New
                    </span>
                  )}
                  {closed && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                      Closed
                    </span>
                  )}
                </div>

                {a.location && (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{a.location}</span>
                  </p>
                )}

                {/* Clamped so every card in the row is the same height whatever
                    the admin wrote. The full text is on the detail page. */}
                {a.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-500">
                    {a.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-400">
                    {postedLabel(a.createdAt, now)}
                  </span>
                  {a.deadline && (
                    <span
                      className={`flex items-center gap-1.5 font-semibold ${
                        closed ? "text-slate-400" : "text-rose-600"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {deadlineLabel(a.deadline, now)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
