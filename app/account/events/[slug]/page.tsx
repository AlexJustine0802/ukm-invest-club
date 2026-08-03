import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, MapPin, Check } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import { eventPalette, timeRange, eventDateLabel } from "@/lib/eventStyles";
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
        select: { slug: true, published: true, registrationEnabled: true },
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
        title={event.title}
        subtitle={eventDateLabel(event.eventDate)}
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
              className="object-cover"
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
          <h1 className="mt-2 text-2xl font-bold text-navy">{event.title}</h1>

          <div className="mt-4 space-y-1.5 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              {eventDateLabel(event.eventDate)}
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              {timeRange(event.eventDate, event.endDate)}
            </p>
            {event.location && (
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                {event.location}
              </p>
            )}
          </div>

          <p className="mt-6 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {event.description}
          </p>
        </div>
      </article>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        {isPast ? (
          <p className="font-semibold text-slate-500">This event has ended.</p>
        ) : !needsRegistration ? (
          <p className="font-semibold text-slate-600">
            No registration needed — just come along.
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
                href={`/register/${formSlug}`}
                className="mt-4 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Register
              </Link>
            ) : (
              <form action={registerForEvent} className="mt-4">
                <input type="hidden" name="eventId" value={event.id} />
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
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
