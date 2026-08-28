import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin, Check } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import { eventPalette, timeRange, eventDateLabel } from "@/lib/eventStyles";
import { formStatus } from "@/lib/forms";
import { formatDateTime } from "@/lib/utils";
import { registerForEvent } from "../actions";

export const metadata: Metadata = { title: "Event" };
export const dynamic = "force-dynamic";

/**
 * One event, in full.
 *
 * The list only gives a card room for three lines of description, so signing
 * up from there meant committing to something you had not read. Everything the
 * card showed lives here, and the sign-up button sits at the bottom.
 */
export default async function MemberEventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const { slug } = await params;
  const event = await prisma.event.findFirst({
    where: { slug, published: true },
    include: {
      category: true,
      _count: { select: { registrations: true } },
      registrationForm: {
        select: {
          slug: true,
          published: true,
          registrationEnabled: true,
          opensAt: true,
          closesAt: true,
        },
      },
    },
  });
  if (!event) notFound();

  const registration = await prisma.eventRegistration.findUnique({
    where: { eventId_userId: { eventId: event.id, userId: user.id } },
    select: { id: true },
  });

  const now = new Date();
  const isPast = event.eventDate < now;
  const left =
    event.capacity === null
      ? null
      : Math.max(event.capacity - event._count.registrations, 0);
  // Same three questions the list card asks, in the same order.
  const needsRegistration = event.registrationForm?.registrationEnabled ?? false;
  const formSlug =
    needsRegistration && event.registrationForm?.published
      ? event.registrationForm.slug
      : null;
  // A form with a future open date takes no answers yet. Saying so here beats
  // sending someone to the form to be turned away by it.
  const formState = event.registrationForm
    ? formStatus(event.registrationForm, now)
    : null;
  const palette = eventPalette(
    event.category?.color,
    event.category?.title ?? event.title,
  );

  return (
    <>
      <Link
        href="/account/events"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <AccountTopBar
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      <article className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {event.coverImage && (
          <div className="relative h-56 w-full bg-navy sm:h-72">
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-contain object-center"
              sizes="(min-width: 1024px) 768px, 100vw"
              priority
            />
          </div>
        )}

        <div className="p-6">
          {event.category && (
            <span
              className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${palette.badge}`}
            >
              {event.category.title}
            </span>
          )}
          <h1 className="mt-2 break-words text-2xl font-bold leading-tight text-navy">
            {event.title}
          </h1>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50 p-4 sm:p-5">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Date &amp; time
                </p>
                <p className="mt-1 break-words text-sm font-semibold leading-5 text-navy">
                  {eventDateLabel(event.eventDate)}
                </p>
                <p className="mt-1 break-words text-sm font-semibold leading-5 text-navy">
                  {timeRange(event.eventDate, event.endDate)}
                </p>
              </div>
            </div>
            <div className="flex min-w-0 items-start gap-3 rounded-xl bg-slate-50 p-4 sm:p-5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Location
                </p>
                <p className="mt-1 break-words text-sm font-semibold leading-5 text-navy">
                  {event.location ?? "To be announced"}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-slate-100 pt-7">
            <p className="text-xs font-bold uppercase tracking-widest text-navy">
              About this event
            </p>
            <p className="mt-4 break-words whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {event.description}
            </p>
          </div>
        </div>
      </article>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:mt-6 sm:p-6">
        {isPast ? (
          <p className="font-semibold text-slate-500">This event has ended.</p>
        ) : !needsRegistration ? (
          <p className="font-semibold text-slate-600">
            No registration needed  just come along.
          </p>
        ) : formState === "not-yet" ? (
          <>
            <p className="font-bold text-navy">Registration opens soon</p>
            <p className="mt-1 text-sm text-slate-500">
              {event.registrationForm?.opensAt
                ? `Opens ${formatDateTime(event.registrationForm.opensAt)}.`
                : "Check back shortly."}
            </p>
            <button
              type="button"
              disabled
              className="mt-4 w-full cursor-not-allowed rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-400 sm:w-auto"
            >
              Register
            </button>
          </>
        ) : formState === "closed" ? (
          <p className="font-semibold text-slate-500">
            Registration has closed
            {event.registrationForm?.closesAt
              ? ` (${formatDateTime(event.registrationForm.closesAt)})`
              : ""}
            .
          </p>
        ) : registration ? (
          <p className="flex items-center gap-2 font-semibold text-primary">
            <Check className="h-4 w-4" />
            You are registered for this event.
          </p>
        ) : left === 0 ? (
          <p className="font-semibold text-slate-500">
            Registration is full.
          </p>
        ) : (
          <>
            <p className="font-bold text-navy">Register for this event</p>
            {left !== null && (
              <p className="mt-1 text-sm text-slate-500">
                {left} of {event.capacity} {event.seatUnit} left.
              </p>
            )}
            {formSlug ? (
              // Events with a sign-up form go through it; the answers land in
              // the admin responses, same as the public site.
              <Link
                href={`/account/register/${formSlug}`}
                className="mt-4 inline-block w-full rounded-lg bg-primary px-6 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-dark sm:w-auto"
              >
                Register
              </Link>
            ) : (
              <form action={registerForEvent} className="mt-4">
                <input type="hidden" name="eventId" value={event.id} />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark sm:w-auto"
                >
                  Register
                </button>
              </form>
            )}
          </>
        )}
      </section>
    </>
  );
}
