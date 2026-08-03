import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import Can from "@/components/admin/Can";
import { requireView } from "@/lib/adminAccess";
import { formatDate } from "@/lib/utils";
import { getBanner } from "@/lib/highlights";
import { deleteHighlight, setHighlighted } from "./actions";

export const dynamic = "force-dynamic";

/** One highlight switch. A plain form: no client JavaScript, server-checked. */
function HighlightSwitch({
  kind,
  id,
  on,
}: {
  kind: "form" | "career";
  id: string;
  on: boolean;
}) {
  return (
    <form action={setHighlighted}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="highlighted" value={on ? "0" : "1"} />
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
        {on ? "Highlighted" : "Highlight"}
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

export default async function AdminHighlightsPage() {
  await requireView("highlights");

  const [highlights, forms, alerts, showing] = await Promise.all([
    prisma.highlight.findMany({
      orderBy: [{ active: "desc" }, { createdAt: "desc" }],
    }),
    prisma.registrationForm.findMany({
      orderBy: { createdAt: "desc" },
      include: { event: true },
    }),
    prisma.careerAlert.findMany({ orderBy: { createdAt: "desc" } }),
    getBanner(),
  ]);

  const events = forms.filter((f) => f.event);
  const recruitment = forms.filter((f) => !f.event && f.isRecruitment);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Highlights</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            The banner at the top of the member dashboard. Write one here, or
            switch on an event, recruitment round or job below. Only one banner
            fits, so the newest of everything switched on is the one members
            see.
          </p>
          {showing && (
            <p className="mt-2 text-sm font-semibold text-emerald-700">
              Showing now: {showing.title}
            </p>
          )}
        </div>
        <Can module="highlights" action="create">
          <Link href="/admin/highlights/new" className="btn-primary">
            + Add highlight
          </Link>
        </Can>
      </div>

      <section>
        <h2 className="font-bold text-navy">Written highlights</h2>
        {highlights.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">Nothing written yet.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {highlights.map((h) => (
              <div
                key={h.id}
                className="card flex flex-wrap items-start gap-4 p-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      {h.eyebrow}
                    </p>
                    {h.id === showing?.id ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                        Showing now
                      </span>
                    ) : h.active ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-bold text-navy">{h.title}</p>
                  {h.description && (
                    <p className="mt-1 text-sm text-slate-500">
                      {h.description}
                    </p>
                  )}
                  {h.buttonLabel && (
                    <p className="mt-2 text-xs text-slate-400">
                      Button: {h.buttonLabel} → {h.buttonHref || "(no link)"}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Can module="highlights" action="edit">
                    <Link
                      href={`/admin/highlights/${h.id}/edit`}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Edit
                    </Link>
                  </Can>
                  <Can module="highlights" action="delete">
                    <DeleteButton
                      action={deleteHighlight}
                      id={h.id}
                      className="btn-danger px-3 py-1.5 text-xs"
                    />
                  </Can>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-navy">Events</h2>
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
                <Can module="highlights" action="manage">
                  <HighlightSwitch kind="form" id={f.id} on={f.highlighted} />
                </Can>
              </Row>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-bold text-navy">Recruitment</h2>
        {recruitment.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No recruitment round yet.
          </p>
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
                <Can module="highlights" action="manage">
                  <HighlightSwitch kind="form" id={f.id} on={f.highlighted} />
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
                <Can module="highlights" action="manage">
                  <HighlightSwitch kind="career" id={a.id} on={a.highlighted} />
                </Can>
              </Row>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
