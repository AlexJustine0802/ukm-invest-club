import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatWallClockDateTime, isUpcoming } from "@/lib/utils";
import { formStatus } from "@/lib/forms";
import { eventDateLabel, timeRange } from "@/lib/eventStyles";
import Markdown from "@/components/Markdown";
import { TextAnimate } from "@/components/ui/text-animate";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getEvent(slug: string) {
  return prisma.event.findFirst({
    where: { slug, published: true },
    include: {
      category: true,
      registrationForm: {
        select: {
          slug: true,
          published: true,
          registrationEnabled: true,
          opensAt: true,
          closesAt: true,
        },
      },
      _count: { select: { registrations: true } },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.description.slice(0, 155),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const upcoming = isUpcoming(event.eventDate);
  const form = event.registrationForm;
  const formSlug =
    form?.published && form.registrationEnabled ? form.slug : null;
  const formState = form ? formStatus(form) : null;
  const left =
    event.capacity === null
      ? null
      : Math.max(event.capacity - event._count.registrations, 0);
  return (
    <article className="min-h-full bg-slate-50">
      <div className="container-page py-8 sm:py-10">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to events
        </Link>

        <div className="mt-5 grid gap-5 sm:mt-6 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {event.coverImage ? (
              <div className="relative h-48 bg-navy sm:h-80">
                <Image
                  src={event.coverImage}
                  alt={event.title}
                  fill
                  className="object-contain object-center"
                  sizes="(min-width: 1024px) calc(100vw - 440px), 100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
              </div>
            ) : (
              <div className="h-44 bg-gradient-to-br from-navy via-primary-dark to-primary sm:h-56" />
            )}

            <div className="p-6 sm:p-8">
              <div className="flex items-center">
                <span
                  className={`badge ${
                    upcoming
                      ? "bg-success text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {upcoming ? "Upcoming" : "Past event"}
                </span>
              </div>

              <TextAnimate
                as="h1"
                animation="blurInUp"
                by="word"
                once
                className="mt-5 max-w-full break-normal text-3xl font-extrabold leading-tight text-navy [overflow-wrap:normal] sm:text-4xl"
              >
                {event.title}
              </TextAnimate>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1.1fr_1fr]">
                <div className="flex h-full min-w-0 items-start gap-3 rounded-xl bg-slate-50 p-4 sm:p-5">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Date & time
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold leading-5 text-navy">
                      {eventDateLabel(event.eventDate)}
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold leading-5 text-navy">
                      {timeRange(event.eventDate, event.endDate)}
                    </p>
                  </div>
                </div>
                <div className="flex h-full min-w-0 flex-col rounded-xl bg-slate-50 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Location
                    </p>
                  </div>
                  <div className="flex flex-1 items-center pl-8">
                    <p className="break-words text-sm font-semibold leading-6 text-navy">
                      {event.location ?? "To be announced"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-7">
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  About this event
                </p>
                <div className="mt-4">
                  <Markdown content={event.description} />
                </div>
              </div>
            </div>
          </section>

          <aside className="self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Users className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-navy">Join this event</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Reserve your spot and take part in this event with the community.
            </p>

            <div className="mt-6 border-t border-slate-100 pt-5">
              {!upcoming ? (
                <p className="font-semibold text-slate-500">
                  This event has ended.
                </p>
              ) : !formSlug ? (
                <p className="font-semibold text-slate-600">
                  No registration needed — just come along.
                </p>
              ) : formState === "not-yet" ? (
                <>
                  <p className="font-bold text-navy">Registration opens soon</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {form?.opensAt
                      ? `Opens ${formatWallClockDateTime(form.opensAt)} WIB.`
                      : "Check back shortly."}
                  </p>
                  <button
                    type="button"
                    disabled
                    className="btn-primary mt-5 w-full cursor-not-allowed opacity-50"
                  >
                    Register
                  </button>
                </>
              ) : formState === "closed" ? (
                <p className="font-semibold leading-6 text-slate-500">
                  Registration has closed
                  {form?.closesAt
                    ? ` (${formatWallClockDateTime(form.closesAt)} WIB)`
                    : ""}.
                </p>
              ) : left === 0 ? (
                <p className="font-semibold text-slate-500">
                  Registration is full.
                </p>
              ) : (
                <>
                  <p className="font-bold text-navy">Register for this event</p>
                  {left !== null && (
                    <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <Users className="h-4 w-4" />
                      {left} of {event.capacity} {event.seatUnit} left.
                    </p>
                  )}
                  <Link
                    href={`/register/${formSlug}`}
                    className="btn-primary mt-5 w-full"
                  >
                    Register now
                  </Link>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
