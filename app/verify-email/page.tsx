import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { consumeAuthToken } from "@/lib/authTokens";

export const metadata: Metadata = { title: "Confirm your email" };
export const dynamic = "force-dynamic";

/**
 * The other end of the confirmation link.
 *
 * The token is consumed on sight — single use, whether or not it was still
 * valid — so a link that leaks from an inbox cannot be replayed later.
 */
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const userId = token ? await consumeAuthToken(token, "VERIFY") : null;

  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() },
    });
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
        {userId ? (
          <>
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <h1 className="mt-4 text-xl font-bold text-navy">Email confirmed</h1>
            <p className="mt-2 text-sm text-slate-500">
              Thanks — your address is verified.
            </p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-12 w-12 text-slate-300" />
            <h1 className="mt-4 text-xl font-bold text-navy">
              This link is no longer valid
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Confirmation links last 24 hours and work once. Send yourself a
              new one from Settings.
            </p>
          </>
        )}

        <Link
          href="/account/settings"
          className="mt-6 inline-block rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
        >
          Back to Settings
        </Link>
      </div>
    </div>
  );
}
