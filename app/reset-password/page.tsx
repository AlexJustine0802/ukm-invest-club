import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset Password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthCard
        title="Link Not Valid"
        subtitle="This password reset link is missing or malformed. Request a new one."
      >
        <div className="flex flex-col items-center gap-6">
          <XCircle className="h-16 w-16 text-red-500" />
          <Link
            href="/forgot-password"
            className="btn-primary w-full py-3 text-center"
          >
            Request New Link
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Set a New Password" subtitle="Choose a new password for your PFC account.">
      <ResetPasswordForm token={token} />
    </AuthCard>
  );
}
