import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SubmitButton from "@/components/admin/SubmitButton";
import { requirePage } from "@/lib/adminAccess";
import {
  ACTION_LABELS,
  ADMIN_ACCESS,
  SECTION_MODULES,
  hasAccess,
  parsePermissions,
} from "@/lib/permissions";
import { allRoles, divisionName, roleLevel } from "@/lib/roles";
import { updateRolePermissions } from "../actions";

export const dynamic = "force-dynamic";

const WORKSPACE_LABELS = {
  public: "Public Website",
  dashboard: "Member Dashboard",
} as const;

export default async function RolePermissionsPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  await requirePage("permissions", "edit");

  const { role: encoded } = await params;
  const role = decodeURIComponent(encoded);
  if (!allRoles().includes(role)) notFound();

  const [row, holders] = await Promise.all([
    prisma.rolePermission.findUnique({ where: { role } }),
    prisma.user.findMany({
      where: { role },
      select: { id: true, name: true, division: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const current = parsePermissions(row?.permissions);

  return (
    <div>
      <Link
        href="/admin/members/permissions"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to permissions
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">{role}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {roleLevel(role).toLowerCase()} ·{" "}
        {holders.length === 0
          ? "nobody holds this role yet"
          : holders
              .map(
                (h) =>
                  `${h.name}${h.division ? ` (${divisionName(h.division)})` : ""}`,
              )
              .join(", ")}
      </p>

      <form action={updateRolePermissions} className="mt-6 space-y-6">
        <input type="hidden" name="role" value={role} />

        {/* The door, first and on its own: with this off nothing below it
            takes effect, and there is no Admin menu in the member portal. */}
        <label className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <input
            type="checkbox"
            name="perm"
            value={`${ADMIN_ACCESS.module}:${ADMIN_ACCESS.action}`}
            defaultChecked={hasAccess(current)}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            <span className="font-semibold text-navy">
              Can open the Admin workspace
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Adds the Admin item to this role&apos;s member sidebar. They sign
              in with their own account as usual  the super admin username and
              password are never shared. Turn this off to close the workspace
              for the role without clearing the sections below.
            </span>
          </span>
        </label>

        {(["public", "dashboard"] as const).map((workspace) => (
          <section key={workspace}>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
              {WORKSPACE_LABELS[workspace]}
            </h2>
            <div className="mt-2 space-y-3">
              {SECTION_MODULES.filter((m) => m.workspace === workspace).map(
                (m) => (
                  <div key={m.id} className="card p-4">
                    <p className="font-semibold text-navy">{m.label}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {m.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                      {m.actions.map((action) => (
                        <label
                          key={action}
                          className="flex items-center gap-2 text-sm font-medium text-navy"
                        >
                          <input
                            type="checkbox"
                            name="perm"
                            value={`${m.id}:${action}`}
                            defaultChecked={current[m.id]?.includes(action)}
                            className="h-4 w-4"
                          />
                          {ACTION_LABELS[action]}
                        </label>
                      ))}
                    </div>
                  </div>
                ),
              )}
            </div>
          </section>
        ))}

        <p className="text-xs text-slate-500">
          Roles, divisions, site settings and this page belong to the Super
          Admin and are never delegable, so they are not listed above. View is
          what makes a section appear at all  a role with Create but no View
          cannot reach the page.
        </p>

        <div className="flex items-center gap-3">
          <SubmitButton label="Save permissions" />
          <Link href="/admin/members/permissions" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
