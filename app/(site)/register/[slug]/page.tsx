import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarClock, CheckCircle2, Lock, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";
import RegistrationFormFill from "@/components/RegistrationFormFill";
import {
  parseQuestions,
  parseAnswers,
  answerText,
  formStatus,
  allowsGuests,
  allowsMembers,
} from "@/lib/forms";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const form = await prisma.registrationForm.findUnique({
    where: { slug },
    select: { title: true },
  });
  return { title: form?.title ?? "Registration" };
}

const shell = "mx-auto max-w-3xl px-4 py-12";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ done?: string }>;
}) {
  const { slug } = await params;
  const { done } = await searchParams;

  const form = await prisma.registrationForm.findUnique({
    where: { slug },
    include: {
      _count: { select: { responses: true } },
      event: { select: { id: true } },
    },
  });

  const status = form ? formStatus(form) : "hidden";

  // A deleted or unpublished form keeps the page shell rather than dropping to
  // a 404 — the link is often already shared, and a bare 404 reads as broken.
  if (!form || status === "hidden") {
    return (
      <div className="bg-slate-50">
        <div className={shell}>
          <div className="rounded-2xl border-t-8 border-primary bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-navy">Registration</h1>
          </div>
          <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
            <Lock className="h-10 w-10 text-slate-300" />
            <p className="font-semibold text-navy">
              Registration is currently unavailable.
            </p>
            <p className="text-sm text-slate-500">
              This form is not open right now. Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const session = await getUserSession();
  const questions = parseQuestions(form.questions);
  const full =
    form.capacity !== null && form._count.responses >= form.capacity;

  // Already answered? Show it back instead of an empty form.
  const existing =
    !form.multipleResponses && session
      ? await prisma.formResponse.findFirst({
          where: { formId: form.id, userId: session.userId },
          orderBy: { createdAt: "desc" },
        })
      : null;

  const header = (
    <div className="rounded-2xl border-t-8 border-primary bg-white p-6 shadow-sm">
      {form.coverImage && (
        <div className="relative mb-5 h-48 w-full overflow-hidden rounded-xl bg-navy">
          <Image
            src={form.coverImage}
            alt={form.title}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 768px, 100vw"
          />
        </div>
      )}
      <h1 className="text-2xl font-bold text-navy">{form.title}</h1>
      {form.description && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
          {form.description}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        {form.closesAt && (
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
            Closes {formatDateTime(form.closesAt)}
          </span>
        )}
        {form.capacity !== null && (
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            {form._count.responses} / {form.capacity} slots filled
          </span>
        )}
      </div>
    </div>
  );

  const notice = (icon: React.ReactNode, title: string, body: React.ReactNode) => (
    <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
      {icon}
      <p className="font-semibold text-navy">{title}</p>
      <div className="text-sm text-slate-500">{body}</div>
    </div>
  );

  let body: React.ReactNode;

  if (done) {
    body = notice(
      <CheckCircle2 className="h-10 w-10 text-emerald-500" />,
      "Your response has been recorded",
      <>
        Thank you for registering. The admin team will be in touch.
        {session && (
          <>
            {" "}
            <Link
              href={form.event ? "/account/events?tab=registration" : "/account"}
              className="font-semibold text-primary hover:underline"
            >
              {form.event ? "Back to events" : "Back to dashboard"}
            </Link>
          </>
        )}
      </>,
    );
  } else if (existing) {
    const answers = parseAnswers(existing.answers);
    body = (
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="flex items-center gap-2 font-semibold text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          You registered on {formatDateTime(existing.createdAt)}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          This form accepts one response per member. Here is what you sent:
        </p>
        <dl className="mt-5 space-y-4">
          {questions.map((q) => (
            <div key={q.id}>
              <dt className="text-sm font-semibold text-navy">{q.label}</dt>
              <dd className="mt-0.5 whitespace-pre-wrap break-words text-sm text-slate-600">
                {q.type === "FILE" && answers[q.id] ? (
                  <a
                    href={String(answers[q.id])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline"
                  >
                    View uploaded file
                  </a>
                ) : (
                  answerText(answers[q.id]) || "—"
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  } else if (status === "not-yet") {
    body = notice(
      <CalendarClock className="h-10 w-10 text-slate-300" />,
      "Not open yet",
      form.opensAt ? `Opens ${formatDateTime(form.opensAt)}.` : "Check back soon.",
    );
  } else if (status === "closed") {
    body = notice(
      <Lock className="h-10 w-10 text-slate-300" />,
      "Registration closed",
      form.closesAt ? `Closed on ${formatDateTime(form.closesAt)}.` : "This form is no longer accepting responses.",
    );
  } else if (full) {
    body = notice(
      <Users className="h-10 w-10 text-slate-300" />,
      "All slots are filled",
      "This registration has reached its capacity.",
    );
  } else if (!session && !allowsGuests(form.audience)) {
    body = notice(
      <Lock className="h-10 w-10 text-slate-300" />,
      "Members only",
      <>
        Please{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          sign in
        </Link>{" "}
        with your member account to register.
      </>,
    );
  } else if (session && !allowsMembers(form.audience)) {
    body = notice(
      <Lock className="h-10 w-10 text-slate-300" />,
      "Not open to member accounts",
      "This form is for external applicants only.",
    );
  } else if (questions.length === 0) {
    body = notice(
      <Lock className="h-10 w-10 text-slate-300" />,
      "This form has no questions yet",
      "The admin team is still setting it up.",
    );
  } else {
    body = (
      <div className="mt-4">
        <RegistrationFormFill
          formId={form.id}
          questions={questions}
          askGuestDetails={!session}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className={shell}>
        {header}
        {body}
      </div>
    </div>
  );
}
