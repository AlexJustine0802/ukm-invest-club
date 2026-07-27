import Link from "next/link";
import { getUiIcon } from "@/lib/uiIcons";
import type { AdminModule } from "@/lib/permissions";

const WORKSPACE_LABELS = {
  public: "Public Website",
  dashboard: "Member Dashboard",
} as const;

/**
 * The landing page a division member sees at /admin: shortcuts to exactly the
 * modules their role may open, nothing else.
 *
 * There is no count or summary here on purpose. The super admin dashboard
 * queries five tables to show totals; this page must not, because it renders
 * for someone who may have no permission to read most of them.
 */
export default function AdminHome({
  name,
  role,
  modules,
}: {
  name: string;
  role: string;
  modules: AdminModule[];
}) {
  const groups = (["public", "dashboard"] as const)
    .map((workspace) => ({
      workspace,
      items: modules.filter((m) => m.workspace === workspace),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Admin</h1>
      <p className="mt-1 text-slate-500">
        {name} · {role}  the sections your role can manage.
      </p>

      {groups.length === 0 && (
        <p className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Your role can open this workspace, but no sections have been assigned
          to it yet. Ask the super admin to grant one under Members →
          Permissions.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.workspace} className="mt-8">
          <h2 className="text-lg font-bold text-navy">
            {WORKSPACE_LABELS[group.workspace]}
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((m) => {
              const Icon = getUiIcon(m.icon);
              return (
                <Link
                  key={m.id}
                  href={m.href}
                  className="card p-5 transition-transform hover:-translate-y-0.5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="mt-3 font-semibold text-navy">{m.label}</p>
                  <p className="mt-0.5 text-sm text-slate-400">
                    {m.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
