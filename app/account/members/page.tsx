import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, CalendarDays, SearchX } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import InlineSearch from "@/components/account/InlineSearch";
import { eventPalette } from "@/lib/eventStyles";
import { formatDate } from "@/lib/utils";
import { DIVISIONS, divisionName } from "@/lib/roles";

export const metadata: Metadata = { title: "Members" };
export const dynamic = "force-dynamic";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; q?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const { role: roleParam, q = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  // Explicit select  passwordHash must never leave the database.
  const members = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      division: true,
      createdAt: true,
    },
    orderBy: [{ division: "asc" }, { role: "asc" }, { name: "asc" }],
  });

  // Filter by division (the org chart), falling back to "no division". Every
  // division is listed whether or not anyone is in it yet  the chart is fixed
  // in lib/roles, so this row is the same height on an empty database.
  const filters = [
    ...DIVISIONS.map((d) => ({ id: d.slug, label: d.name })),
    { id: "none", label: "No division" },
  ];
  const role =
    roleParam && filters.some((f) => f.id === roleParam) ? roleParam : "all";

  const visible = members.filter(
    (m) =>
      (role === "all" ||
        (role === "none" ? !m.division : m.division === role)) &&
      (!query ||
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        m.role.toLowerCase().includes(query) ||
        (divisionName(m.division) ?? "").toLowerCase().includes(query)),
  );

  const hrefWith = (patch: Record<string, string>) => {
    const params = new URLSearchParams();
    if (role !== "all") params.set("role", role);
    if (query) params.set("q", q.trim());
    for (const [key, value] of Object.entries(patch)) params.set(key, value);
    if (params.get("role") === "all") params.delete("role");
    const qs = params.toString();
    return qs ? `/account/members?${qs}` : "/account/members";
  };

  return (
    <>
      <AccountTopBar
        title="Members"
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      <div className="mt-8 flex items-center gap-3">
        <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:thin]">
          <div className="flex w-max items-center gap-3 pb-1">
            {[{ id: "all", label: "All" }, ...filters].map(
              (r) => (
                <Link
                  key={r.id}
                  href={hrefWith({ role: r.id })}
                  className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold ${
                    r.id === role
                      ? "bg-primary text-white"
                      : "border border-slate-200 bg-white text-navy hover:bg-slate-50"
                  }`}
                >
                  {r.label}
                </Link>
              ),
            )}
          </div>
        </div>
        <div className="shrink-0">
          <InlineSearch placeholder="Search members..." />
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-16">
          <SearchX className="h-10 w-10 text-slate-300" />
          <p className="font-semibold text-navy">No members found</p>
          <p className="text-sm text-slate-500">Try another filter or search term.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) => {
            const palette = eventPalette(null, m.name);
            return (
              <article
                key={m.id}
                // min-w-0: a grid item defaults to min-width:auto, which sizes
                // the track to the card's min-content and pushes it past the
                // viewport. With it, the truncates inside can do their job.
                className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold ${palette.badge}`}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    {/* truncate belongs on the text itself  on the flex row it
                        does nothing, and the name then refuses to shrink. */}
                    <p className="flex min-w-0 items-center gap-1.5 font-bold text-navy">
                      <span className="min-w-0 truncate">{m.name}</span>
                      {m.id === user.id && (
                        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                          You
                        </span>
                      )}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded px-2 py-0.5 text-xs font-semibold ${palette.badge}`}
                    >
                      {m.role}
                    </span>
                    {divisionName(m.division) && (
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {divisionName(m.division)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                  <a
                    href={`mailto:${m.email}`}
                    className="flex min-w-0 items-center gap-2 hover:text-primary"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                    {/* min-w-0: a flex item defaults to min-width:auto, so a
                        long address would otherwise widen the whole card. */}
                    <span className="min-w-0 truncate">{m.email}</span>
                  </a>
                  <p className="flex items-center gap-2 text-xs text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Member since {formatDate(m.createdAt)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
