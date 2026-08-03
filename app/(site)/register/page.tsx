import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, Users, ClipboardList, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getUiIcon } from "@/lib/uiIcons";
import { eventPalette } from "@/lib/eventStyles";
import { formStatus, parseQuestions, flattenQuestions } from "@/lib/forms";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Register",
  description: "Open recruitment and event registration for Invest Club.",
};
export const dynamic = "force-dynamic";

export default async function PublicRegisterPage() {
  const forms = await prisma.registrationForm.findMany({
    where: {
      published: true,
      audience: { in: ["PUBLIC", "BOTH"] },
      // Event sign-ups live on the events page; this lists standalone ones.
      event: null,
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { responses: true } } },
  });

  const now = new Date();
  const open = forms.filter((f) => formStatus(f, now) === "open");
  const upcoming = forms.filter((f) => formStatus(f, now) === "not-yet");

  // With a single open form there is nothing to choose  go straight to it.
  if (open.length === 1) redirect(`/register/${open[0].slug}`);

  const listed = [...open, ...upcoming];

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-14">
        <span className="text-sm font-semibold uppercase tracking-widest text-primary">
          Join us
        </span>
        <h1 className="mt-3 text-3xl font-bold text-navy">Registration</h1>
        <p className="mt-3 text-slate-600">
          Open recruitment and event sign-ups. Pick one to fill in its form.
        </p>

        {listed.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-navy">
              Nothing open at the moment
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Follow our socials or check back soon  new recruitment opens here.
            </p>
            <Link
              href="/events"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              See upcoming events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {listed.map((f) => {
              const Icon = getUiIcon(f.icon ?? "ClipboardList");
              const palette = eventPalette(f.color, f.title);
              const notYet = formStatus(f, now) === "not-yet";
              const full =
                f.capacity !== null && f._count.responses >= f.capacity;
              const questionCount = flattenQuestions(
                parseQuestions(f.questions),
              ).length;

              return (
                <article
                  key={f.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center"
                >
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${palette.badge}`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-navy">{f.title}</h2>
                      {notYet && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          Opens {f.opensAt ? formatDateTime(f.opensAt) : "soon"}
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
                    </div>
                  </div>

                  <div className="shrink-0 sm:w-40">
                    {notYet || full ? (
                      <span className="block w-full rounded-lg bg-slate-100 px-6 py-2.5 text-center text-sm font-semibold text-slate-400">
                        {full ? "Full" : "Not open"}
                      </span>
                    ) : (
                      <Link
                        href={`/register/${f.slug}`}
                        className="block w-full rounded-lg bg-primary px-6 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-dark"
                      >
                        Register
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
