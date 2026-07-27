import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePage } from "@/lib/adminAccess";
import {
  countPermissions,
  hasAccess,
  parsePermissions,
  TOTAL_PERMISSIONS,
} from "@/lib/permissions";
import { DIVISIONS, GENERAL_ROLES, rolesFor } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function PermissionsPage() {
  await requirePage("permissions", "view");

  const rows = await prisma.rolePermission.findMany();
  const byRole = new Map(
    rows.map((r) => {
      const map = parsePermissions(r.permissions);
      return [
        r.role,
        { granted: countPermissions(map), open: hasAccess(map) },
      ] as const;
    }),
  );

  const memberCounts = await prisma.user.groupBy({
    by: ["role"],
    _count: { _all: true },
  });
  const people = new Map(memberCounts.map((m) => [m.role, m._count._all]));

  // Org-chart order, then the roles that belong to no division.
  const groups = [
    ...DIVISIONS.map((d) => ({ label: d.name, roles: rolesFor(d.slug) })),
    { label: "No division", roles: GENERAL_ROLES },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Permissions</h1>
      <p className="mt-1 text-sm text-slate-500">
        What each role can do in the admin workspace. Everything is off until
        you switch it on, and a role with nothing switched on never sees the
        Admin menu at all. Roles, divisions and this page stay with the super
        admin.
      </p>

      <div className="mt-6 space-y-6">
        {groups.map((group) => (
          <section key={group.label}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
              {group.label}
            </h2>
            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {group.roles.map((role) => {
                const { granted, open } = byRole.get(role) ?? {
                  granted: 0,
                  open: false,
                };
                const holders = people.get(role) ?? 0;
                return (
                  <Link
                    key={role}
                    href={`/admin/members/permissions/${encodeURIComponent(role)}`}
                    className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-navy">
                        {role}
                      </span>
                      <span className="text-xs text-slate-400">
                        {holders === 0
                          ? "nobody assigned"
                          : `${holders} ${holders === 1 ? "person" : "people"}`}
                      </span>
                    </span>
                    {/* Sections ticked with the door shut is the one state
                        that looks like a bug, so it says so plainly. */}
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        !open && granted > 0
                          ? "bg-amber-50 text-amber-700"
                          : granted === 0
                            ? "bg-slate-100 text-slate-400"
                            : "bg-blue-50 text-primary"
                      }`}
                    >
                      {granted === 0
                        ? "No access"
                        : !open
                          ? "Workspace closed"
                          : `${granted} of ${TOTAL_PERMISSIONS}`}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
