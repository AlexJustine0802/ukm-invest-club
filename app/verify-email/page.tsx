import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { consumeAuthToken } from "@/lib/authTokens";
import AuthCard from "@/components/auth/AuthCard";

export const metadata: Metadata = { title: "Verify Email" };
export const dynamic = "force-dynamic";

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
    <AuthCard
      title={userId ? "Email Verified!" : "Link Not Valid"}
      subtitle={
        userId
          ? "Your account is active. You can log in and start exploring ICU."
          : "This verification link is invalid or has expired. Log in again and we will send you a fresh one."
      }
    >
      <div className="flex flex-col items-center gap-6">
        {userId ? (
          <CheckCircle2 className="h-16 w-16 text-emerald-500" />
        ) : (
          <XCircle className="h-16 w-16 text-red-500" />
        )}
        <Link href="/login" className="btn-primary w-full py-3 text-center">
          Go to Log In
        </Link>
      </div>
    </AuthCard>
  );
}
