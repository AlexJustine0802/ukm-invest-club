"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * The last line of defence for any server render that throws.
 *
 * In practice it is nearly always the database: Supabase pauses a free project
 * after a week idle, and every page here reads Prisma, so the whole app would
 * otherwise show a raw stack trace. This says what happened in one sentence and
 * offers the only two useful actions — try again, or go somewhere else.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Still logged: a friendly page must not make the real cause harder to find.
    console.error("[app] unhandled error", error);
  }, [error]);

  // The connector wraps it, so the readable part is in the message text.
  const isDatabase = /database|prisma|connect|timeout/i.test(error.message);

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </span>

        <h1 className="mt-4 text-xl font-bold text-navy">
          {isDatabase ? "Cannot reach the database" : "Something went wrong"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {isDatabase
            ? "The site is up, but the database is not responding right now. This usually clears by itself in a few minutes."
            : "This page failed to load. Trying again often works."}
        </p>

        {error.digest && (
          <p className="mt-3 text-xs text-slate-400">
            Reference: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
