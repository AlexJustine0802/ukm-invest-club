import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Can from "@/components/admin/Can";
import DeleteButton from "@/components/admin/DeleteButton";
import { requireView } from "@/lib/adminAccess";
import { getUiIcon } from "@/lib/uiIcons";
import { formatDate } from "@/lib/utils";
import { deleteAnnouncement, setAnnounced } from "./actions";

export const dynamic = "force-dynamic";

/**
 * One announce switch. A plain form, so it needs no client JavaScript and the
 * permission is checked on the server where it belongs.
 */
function AnnounceSwitch({
  kind,
  id,
  on,
}: {
  kind: "form" | "career";
  id: string;
  on: boolean;
}) {
  return (
    <form action={setAnnounced}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="announced" value={on ? "0" : "1"} />
      <button
        type="submit"
        aria-pressed={on}
        className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
          on
            ? "bg-emerald-50 text-emerald-700"
            : "border border-slate-200 text-slate-500 hover:bg-slate-50"
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${on ? "bg-emerald-500" : "bg-slate-300"}`}
        />
        {on ? "Announced" : "Announce"}
      </button>
    </form>
  );
}

function Row({
  title,
  detail,
  children,
}: {
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card flex flex-wrap items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold text-navy">{title}</p>
        <p className="truncate text-xs text-slate-400">{detail}</p>
      </div>
      {children}
    </div>
  );
}

export default async function AdminAnnouncementsPage() {
  await requireView("announcements");

  const [written, forms, alerts] = await Promise.all([
    prisma.dashboardItem.findMany({
      where: { section: "announcement" },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.registrationForm.findMany({
      orderBy: { createdAt: "desc" },
      include: { event: true },
    }),
    prisma.careerAlert.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const events = forms.filter((f) => f.event);
  const recruitment = forms.filter((f) => !f.event && f.isRecruitment);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Announcements</h1>
        </div>
        <Can module="announcements" action="create">
          <Link href="/admin/announcements/new" className="btn-primary">
            + Write announcement
          </Link>
        </Can>
      </div>

      <section>
        <h2 className="font-bold text-navy">Written announcements</h2>
        {written.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing written yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {written.map((a) => {
              const Icon = getUiIcon(a.icon);
              return (
                <div
                  key={a.id}
                  className="card flex flex-wrap items-center gap-4 p-4"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.color ?? "bg-blue-50 text-primary"}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-navy">{a.title}</p>
                      {a.badge && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                          {a.badge}
                        </span>
                      )}
                      {!a.active && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                          Hidden
                        </span>
                      )}
                    </div>
                    {a.subtitle && (
                      <p className="truncate text-sm text-slate-500">
                        {a.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Can module="announcements" action="edit">
                      <Link
                        href={`/admin/announcements/${a.id}/edit`}
                        className="btn-secondary px-3 py-1.5 text-xs"
                      >
                        Edit
                      </Link>
                    </Can>
                    <Can module="announcements" action="delete">
                      <DeleteButton
                        action={deleteAnnouncement}
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
      </section>

      <section>
        <h2 className="font-bold text-navy">Events</h2>
        <p className="mt-1 text-sm text-slate-500">
          Every event, newest first. Switch one on to announce it.
        </p>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No events yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {events.map((f) => (
              <Row
                key={f.id}
                title={f.event!.title}
                detail={`${formatDate(f.event!.eventDate)}${
                  f.event!.location ? ` · ${f.event!.location}` : ""
                }${f.published ? "" : " · form unpublished"}`}
              >
                <Can module="announcements" action="manage">
                  <AnnounceSwitch kind="form" id={f.id} on={f.announced} />
                </Can>
              </Row>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-navy">Recruitment</h2>
        {recruitment.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No recruitment round yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {recruitment.map((f) => (
              <Row
                key={f.id}
                title={f.title}
                detail={
                  f.closesAt
                    ? `Closes ${formatDate(f.closesAt)}`
                    : "No closing date"
                }
              >
                <Can module="announcements" action="manage">
                  <AnnounceSwitch kind="form" id={f.id} on={f.announced} />
                </Can>
              </Row>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-navy">Career alerts</h2>
        {alerts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No job postings yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {alerts.map((a) => (
              <Row
                key={a.id}
                title={`${a.role} · ${a.company}`}
                detail={`${a.workType}${a.location ? ` · ${a.location}` : ""}${
                  a.published ? "" : " · hidden"
                }`}
              >
                <Can module="announcements" action="manage">
                  <AnnounceSwitch kind="career" id={a.id} on={a.announced} />
                </Can>
              </Row>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
