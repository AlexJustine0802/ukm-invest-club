import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime, isUpcoming } from "@/lib/utils";
import { formStatus } from "@/lib/forms";
import Markdown from "@/components/Markdown";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getEvent(slug: string) {
  return prisma.event.findFirst({
    where: { slug, published: true },
    include: {
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

  // The sign-up button only exists when there is somewhere for it to go: a
  // published form with registration still switched on.
  const form = event.registrationForm;
  const formSlug =
    form?.published && form.registrationEnabled ? form.slug : null;
  // Not open yet / already closed is worth saying here, rather than letting
  // the button lead to a form that refuses the answer.
  const formState = form ? formStatus(form) : null;
  const left =
    event.capacity === null
      ? null
      : Math.max(event.capacity - event._count.registrations, 0);

  return (
    <article>
      {event.coverImage && (
        <div className="relative h-72 w-full bg-navy sm:h-96">
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            className="object-cover opacity-90"
            priority
          />
        </div>
      )}
      <div className="container-page py-12">
        <Link
          href="/events"
          className="text-sm font-medium text-primary hover:text-primary-dark"
        >
          ← Back to events
        </Link>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span
            className={`badge ${
              upcoming ? "bg-success text-white" : "bg-slate-200 text-slate-600"
            }`}
          >
            {upcoming ? "Upcoming" : "Past event"}
          </span>
          <span className="text-sm text-slate-500">
            {formatDateTime(event.eventDate)}
          </span>
        </div>

        <h1 className="mt-3 text-4xl font-extrabold text-navy">
          {event.title}
        </h1>
        {event.location && (
          <p className="mt-2 text-slate-600">📍 {event.location}</p>
        )}

        <div className="mt-8 max-w-3xl">
          <Markdown content={event.description} />
        </div>

        {/* Sign-up lives at the bottom, after what the event actually is. */}
        <div className="mt-10 max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
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
              <p className="mt-1 text-sm text-slate-500">
                {form?.opensAt
                  ? `Opens ${formatDateTime(form.opensAt)}.`
                  : "Check back shortly."}
              </p>
              <button
                type="button"
                disabled
                className="btn-primary mt-4 cursor-not-allowed px-6 py-2.5 opacity-50"
              >
                Register
              </button>
            </>
          ) : formState === "closed" ? (
            <p className="font-semibold text-slate-500">
              Registration has closed
              {form?.closesAt ? ` (${formatDateTime(form.closesAt)})` : ""}.
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
              <Link
                href={`/register/${formSlug}`}
                className="btn-primary mt-4 inline-block px-6 py-2.5"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
