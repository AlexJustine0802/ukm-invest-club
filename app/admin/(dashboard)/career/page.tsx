import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { getUiIcon } from "@/lib/uiIcons";
import { eventPalette } from "@/lib/eventStyles";
import { isNewAlert, postedLabel, deadlineLabel } from "@/lib/career";
import { deleteCareerAlert } from "./actions";
import Can from "@/components/admin/Can";
import { requireView } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function AdminCareerPage() {
  await requireView("career");

  const alerts = await prisma.careerAlert.findMany({
    orderBy: { createdAt: "desc" },
  });
  const now = new Date();

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Career alerts</h1>
        </div>
        <Can module="career" action="create">
          <Link href="/admin/career/new" className="btn-primary">
            + Post job
          </Link>
        </Can>
      </div>

      {alerts.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No job postings yet.{" "}
          <Can module="career" action="create">
            <Link href="/admin/career/new" className="text-accent-dark underline">
              Add one
            </Link>
          </Can>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {alerts.map((a) => {
            const Icon = getUiIcon(a.icon ?? "Briefcase");
            const palette = eventPalette(a.color, a.company);
            return (
              <div key={a.id} className="card flex flex-wrap items-start gap-4 p-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${palette.badge}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-navy">{a.role}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      {a.workType}
                    </span>
                    {a.published && isNewAlert(a.createdAt, now) && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        In the bell
                      </span>
                    )}
                    {!a.published && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">
                    {a.company}
                    {a.location ? ` • ${a.location}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {postedLabel(a.createdAt, now)}
                    {a.deadline ? ` · ${deadlineLabel(a.deadline, now)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Can module="career" action="edit">
                    <Link
                      href={`/admin/career/${a.id}/edit`}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Edit
                    </Link>
                  </Can>
                  <Can module="career" action="delete">
                    <DeleteButton
                      action={deleteCareerAlert}
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
