"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Mail, MailCheck } from "lucide-react";
import {
  requestPasswordReset,
  type ForgotState,
} from "@/app/forgot-password/actions";
import { IconInput } from "./authParts";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
      {pending ? "Sending…" : "Send Reset Link"}
    </button>
  );
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState<ForgotState, FormData>(
    requestPasswordReset,
    {},
  );

  if (state.sent) {
    return (
      <div className="flex flex-col items-center gap-6">
        <MailCheck className="h-16 w-16 text-emerald-500" />
        <p className="text-center text-sm text-slate-500">
          If an account exists for that email, we have sent a password reset
          link. Check your inbox — the link expires in 1 hour.
        </p>
        <Link href="/login" className="btn-primary w-full py-3 text-center">
          Back to Log In
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-navy">
          Email
        </label>
        <IconInput
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          icon={Mail}
        />
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-slate-500">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Log In
        </Link>
      </p>
    </form>
  );
}
