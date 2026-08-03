import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Lock,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import { getUiIcon } from "@/lib/uiIcons";
import { formStatus, parseQuestions, flattenQuestions } from "@/lib/forms";
import { formatDateTime } from "@/lib/utils";
import { DIVISIONS } from "@/lib/roles";

export const metadata: Metadata = { title: "Recruitment" };
export const dynamic = "force-dynamic";

/** What an applicant goes through, shown as the timeline. */
const STEPS = [
  {
    icon: FileText,
    title: "Fill in the form",
    body: "Tell us who you are, which division you want, and why.",
  },
  {
    icon: ClipboardList,
    title: "Administration check",
    body: "We review every submission after the form closes.",
  },
  {
    icon: MessageSquare,
    title: "Interview",
    body: "A short chat with the division you applied to.",
  },
  {
    icon: CheckCircle2,
    title: "Announcement",
    body: "Results are announced here and by email.",
  },
];

export default async function RecruitmentPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  // The newest recruitment form wins, so last year's does not linger.
  //
  // Unpublished forms are fetched too, but only so the closed state can
  // announce their opening date. formStatus still reports them as "hidden", so
  // nothing else about an unpublished form reaches the page.
  const recruitment = await prisma.registrationForm.findFirst({
    where: { isRecruitment: true },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { responses: true } } },
  });

  const now = new Date();
  const status = recruitment ? formStatus(recruitment, now) : "hidden";
  const isOpen = status === "open";

  // The single admin-editable "when does recruitment open" date: the form's
  // opensAt, as long as it is still in the future.
  const opensAt =
    recruitment?.opensAt && recruitment.opensAt > now
      ? recruitment.opensAt
      : null;

  const myResponse =
    recruitment &&
    (await prisma.formResponse.findFirst({
      where: { formId: recruitment.id, userId: user.id },
      select: { createdAt: true },
    }));

  const full =
    recruitment?.capacity != null &&
    recruitment._count.responses >= recruitment.capacity;

  const topBar = (
    <AccountTopBar
      title="Recruitment"
      showSearch={false}
      name={user.name}
      initial={user.name.charAt(0).toUpperCase()}
      role={user.role}
    />
  );

  // ---- Closed: nothing published, not open yet, or already ended ----
  if (!isOpen) {
    const heading = opensAt
      ? "Recruitment opens soon"
      : status === "closed"
        ? "Recruitment is closed"
        : "Recruitment is not open";

    const detail = opensAt
      ? "Applications are not open yet. Mark the date below so you are ready."
      : status === "closed" && recruitment?.closesAt
        ? `Applications closed on ${formatDateTime(recruitment.closesAt)}.`
        : "There is no open recruitment right now. When the committee opens one, it will appear here.";

    return (
      <>
        {topBar}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col items-center gap-4 bg-gradient-to-b from-blue-50 to-white px-6 py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
              <Lock className="h-7 w-7" />
            </span>
            <h2 className="text-2xl font-bold text-navy">{heading}</h2>
            <p className="max-w-md text-sm text-slate-500">{detail}</p>
            {opensAt && (
              <p className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-primary">
                <CalendarClock className="h-4 w-4" />
                Opens {formatDateTime(opensAt)}
              </p>
            )}
            {myResponse && (
              <p className="flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                You applied on {formatDateTime(myResponse.createdAt)}
              </p>
            )}
            <Link
              href="/account/announcements"
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Check announcements
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </>
    );
  }

  // ---- Open ----
  const Icon = getUiIcon(recruitment!.icon ?? "Users");
  const questionCount = flattenQuestions(
    parseQuestions(recruitment!.questions),
  ).length;
  const applyHref = `/register/${recruitment!.slug}`;

  return (
    <>
      {topBar}

      {/* Hero */}
      <section className="relative mt-8 overflow-hidden rounded-2xl border border-navy-light/40 bg-gradient-to-br from-navy-dark via-navy to-navy-light text-white">
        {recruitment!.coverImage && (
          <>
            <Image
              src={recruitment!.coverImage}
              alt=""
              fill
              className="object-cover opacity-30"
              sizes="(min-width: 1024px) 900px, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/50" />
          </>
        )}
        <div className="relative px-6 py-12 sm:px-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/25 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-light">
            <Sparkles className="h-3.5 w-3.5" />
            Open recruitment
          </span>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight sm:text-4xl">
            {recruitment!.title}
          </h2>
          {recruitment!.description && (
            <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm text-slate-200">
              {recruitment!.description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-200">
            {recruitment!.closesAt && (
              <span className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary-light" />
                Closes {formatDateTime(recruitment!.closesAt)}
              </span>
            )}
            {recruitment!.capacity !== null && (
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary-light" />
                {recruitment!._count.responses} / {recruitment!.capacity}{" "}
                applicants
              </span>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {myResponse ? (
              <>
                <span className="flex items-center gap-2 rounded-lg bg-emerald-500/15 px-5 py-3 text-sm font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  Applied {formatDateTime(myResponse.createdAt)}
                </span>
                <Link
                  href={applyHref}
                  className="rounded-lg bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/20"
                >
                  View my answers
                </Link>
              </>
            ) : full ? (
              <span className="rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-slate-300">
                All slots are filled
              </span>
            ) : (
              <Link
                href={applyHref}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary-dark"
              >
                Apply now
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-bold text-navy">How it works</h3>
        <ol className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary">
                <step.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                Step {i + 1}
              </p>
              <p className="mt-1 font-semibold text-navy">{step.title}</p>
              <p className="mt-1 text-sm text-slate-500">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Divisions */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-bold text-navy">Which division fits you?</h3>
        <p className="mt-1 text-sm text-slate-500">
          Every division takes new people except the PVPC board. You pick your
          preference inside the form.
        </p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DIVISIONS.filter((d) => d.structure !== "EXECUTIVE").map((d) => (
            <div
              key={d.slug}
              className="rounded-xl border border-slate-200 p-4 transition hover:border-primary/50"
            >
              <p className="font-semibold text-navy">{d.name}</p>
              <ul className="mt-2 space-y-1">
                {d.units.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2 text-xs text-slate-500"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      {!myResponse && !full && (
        <section className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-blue-50 px-6 py-10 text-center">
          <h3 className="text-lg font-bold text-navy">Ready to apply?</h3>
          <p className="max-w-md text-sm text-slate-600">
            Fill in the form and we will get back to you after it closes
            {recruitment!.closesAt
              ? ` on ${formatDateTime(recruitment!.closesAt)}`
              : ""}
            .
          </p>
          <Link
            href={applyHref}
            className="mt-1 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Fill the recruitment form
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      <p className="mt-6 text-center text-xs text-slate-400">
        Looking for something else?{" "}
        <Link
          href="/account/events"
          className="font-semibold text-primary hover:underline"
        >
          Browse upcoming events
        </Link>
      </p>
    </>
  );
}
