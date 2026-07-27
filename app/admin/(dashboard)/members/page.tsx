import Link from "next/link";
import { prisma } from "@/lib/prisma";
import MemberRoleForm from "@/components/admin/MemberRoleForm";
import { DIVISIONS, divisionName, isHead, GENERAL_ROLES } from "@/lib/roles";
import { formatDate } from "@/lib/utils";
import { updateMemberRole, clearMemberRole } from "./actions";
import Can from "@/components/admin/Can";
import { can, requireView } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ division?: string; q?: string }>;
}) {
  await requireView("members");

  // Roles and divisions belong to the super admin. A role granted only
  // "view" gets the directory  who the members are  without the org chart
  // around it: no role, no division, no editing controls.
  const manages = await can("member-roles", "edit");

  const { division: divisionParam, q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  // ?division= is ignored without role management, or the filter would give
  // away who is in which division a URL at a time.
  const division =
    manages &&
    (divisionParam === "none" ||
      DIVISIONS.some((d) => d.slug === divisionParam))
      ? divisionParam
      : "all";

  // Explicit select  never pull passwordHash into a page.
  const members = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      division: true,
      createdAt: true,
    },
    orderBy: [{ division: "asc" }, { name: "asc" }],
  });

  const visible = members.filter(
    (m) =>
      (division === "all" ||
        (division === "none" ? m.division === null : m.division === division)) &&
      (!query ||
        m.name.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query) ||
        // Searching by role would give the org chart back a query at a time.
        (manages && m.role.toLowerCase().includes(query))),
  );

  const countIn = (slug: string) =>
    members.filter((m) => m.division === slug).length;

  const chipHref = (id: string) => {
    const params = new URLSearchParams();
    if (id !== "all") params.set("division", id);
    if (query) params.set("q", q.trim());
    const qs = params.toString();
    return qs ? `/admin/members?${qs}` : "/admin/members";
  };

  const chips = [
    { id: "all", label: `All (${members.length})` },
    ...DIVISIONS.map((d) => ({ id: d.slug, label: `${d.name} (${countIn(d.slug)})` })),
    { id: "none", label: `No division (${members.filter((m) => !m.division).length})` },
  ];

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-navy">
          {manages ? "Members & roles" : "Members"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {manages ? (
            <>
              Every registered account. Set a division and a role  the role
              list follows the division, and each division except PVPC has a
              Head. Members see this on <code>/account/members</code>.
            </>
          ) : (
            <>
              Every registered account. Roles and divisions are set by the
              super admin.
            </>
          )}
        </p>
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-center gap-2">
        {division !== "all" && (
          <input type="hidden" name="division" value={division} />
        )}
        <input
          name="q"
          defaultValue={q}
          placeholder={
            manages ? "Search name, email or role..." : "Search name or email..."
          }
          className="input max-w-xs"
        />
        <button type="submit" className="btn-secondary">
          Search
        </button>
        {(query || division !== "all") && (
          <Link href="/admin/members" className="text-xs text-slate-500 underline">
            Reset
          </Link>
        )}
      </form>

      {/* Not merely hidden with CSS: the chips carry every division name and
          its headcount, so for a view-only role they are never rendered. */}
      {manages && (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((c) => (
            <Link
              key={c.id}
              href={chipHref(c.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                c.id === division
                  ? "bg-navy text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="mt-8 text-slate-500">No members match that filter.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {visible.map((m) => (
            <div key={m.id} className="card flex flex-wrap items-center gap-4 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-base font-bold text-primary">
                {m.name.charAt(0).toUpperCase()}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-navy">{m.name}</p>
                  {manages && isHead(m.role) && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-semibold text-primary-dark">
                      Head
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{m.email}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {manages && (
                    <>
                      {m.role}
                      {divisionName(m.division)
                        ? ` · ${divisionName(m.division)}`
                        : ""}{" "}
                      ·{" "}
                    </>
                  )}
                  joined {formatDate(m.createdAt)}
                </p>
              </div>

              {/* The whole controls column is role management, so it is one
                  permission: the dropdowns carry the org chart in their
                  options, not just the buttons. */}
              {manages && (
                <div className="flex flex-wrap items-center gap-2">
                  <MemberRoleForm
                    action={updateMemberRole}
                    userId={m.id}
                    division={m.division}
                    role={m.role}
                  />
                  <Can module="member-roles" action="edit">
                    <Link
                      href={`/admin/members/${m.id}/edit`}
                      className="btn-secondary px-3 py-2 text-xs"
                    >
                      Edit profile
                    </Link>
                  </Can>
                  {(m.division || m.role !== GENERAL_ROLES[0]) && (
                    <form action={clearMemberRole}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className="btn-secondary px-3 py-2 text-xs"
                        title="Reset to plain Member with no division"
                      >
                        Reset
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
