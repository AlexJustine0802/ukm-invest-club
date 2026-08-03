import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Users,
  MapPin,
  Clock,
  CalendarClock,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import Markdown from "@/components/Markdown";
import CompanyLogo from "@/components/account/CompanyLogo";
import { eventPalette } from "@/lib/eventStyles";
import { isNewAlert, deadlineLabel, postedLabel } from "@/lib/career";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Career Alert" };
export const dynamic = "force-dynamic";

/**
 * One job posting in full.
 *
 * Laid out like a job board: what the role is and how to apply sit together at
 * the top, the write-up runs underneath, and the company sits at the bottom.
 * The description is Markdown, so an admin pasting a posting keeps its own
 * headings and bullet lists.
 */
export default async function CareerAlertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const { id } = await params;
  const alert = await prisma.careerAlert.findFirst({
    where: { id, published: true },
  });
  if (!alert) notFound();

  const now = new Date();
  const closed = alert.deadline !== null && alert.deadline < now;
  const palette = eventPalette(alert.color, alert.company);

  const metaRow = (icon: React.ReactNode, text: React.ReactNode) => (
    <p className="flex items-center gap-2.5 text-sm text-slate-600">
      <span className="shrink-0 text-slate-400">{icon}</span>
      {text}
    </p>
  );

  return (
    <>
      <Link
        href="/account/career"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Career Alerts
      </Link>

      <AccountTopBar
        title="Career Alert"
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      <div className="mt-8 max-w-3xl space-y-4">
        {/* What the role is, and the button to act on it. */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-snug text-navy">
                {alert.role}
              </h1>
              <p className="mt-1 text-lg text-slate-600">{alert.company}</p>
            </div>
            <CompanyLogo
              logo={alert.logo}
              company={alert.company}
              className="h-16 w-16"
              fallbackClassName={palette.badge}
            />
          </div>

          <div className="mt-5 space-y-2">
            {alert.location &&
              metaRow(<MapPin className="h-4 w-4" />, alert.location)}
            {metaRow(<Briefcase className="h-4 w-4" />, alert.workType)}
            {alert.deadline &&
              metaRow(
                <CalendarClock className="h-4 w-4" />,
                <span
                  className={
                    closed ? "text-slate-400" : "font-semibold text-rose-600"
                  }
                >
                  {deadlineLabel(alert.deadline, now)} ·{" "}
                  {formatDateTime(alert.deadline)}
                </span>,
              )}
            {metaRow(
              <Clock className="h-4 w-4" />,
              <span className="text-slate-500">
                Posted {postedLabel(alert.createdAt, now).toLowerCase()}
              </span>,
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {alert.applyUrl && !closed ? (
              <a
                href={alert.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Apply now
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <span className="rounded-lg bg-slate-100 px-7 py-3 text-sm font-semibold text-slate-400">
                {closed ? "Applications closed" : "No application link"}
              </span>
            )}

            {isNewAlert(alert.createdAt, now) && !closed && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Sparkles className="h-3.5 w-3.5" />
                Newly posted
              </span>
            )}
          </div>
        </section>

        {/* The posting itself. */}
        {alert.description && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <Markdown content={alert.description} />
          </section>
        )}

        {/* Who is hiring. */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold text-navy">Company profile</h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <CompanyLogo
              logo={alert.logo}
              company={alert.company}
              className="h-14 w-14"
              fallbackClassName={palette.badge}
            />
            <div className="min-w-0">
              <p className="text-lg font-semibold text-navy">{alert.company}</p>
              <div className="mt-1 space-y-1 text-sm text-slate-500">
                {alert.companyIndustry && (
                  <p className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {alert.companyIndustry}
                  </p>
                )}
                {alert.companySize && (
                  <p className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    {alert.companySize}
                  </p>
                )}
                {!alert.companyIndustry && !alert.companySize && (
                  <p>
                    {alert.workType}
                    {alert.location ? ` · ${alert.location}` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>

          {alert.companyProfile && (
            <div className="mt-5">
              <Markdown content={alert.companyProfile} />
            </div>
          )}

          {alert.companyWebsite && (
            <a
              href={alert.companyWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Visit website
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </section>

        <p className="text-xs text-slate-400">
          Posted by the Invest Club admin team. Applications are handled by the
          company, not by ICU.
        </p>
      </div>
    </>
  );
}
