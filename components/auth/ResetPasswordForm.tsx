"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Lock } from "lucide-react";
import { resetPassword, type ResetState } from "@/app/reset-password/actions";
import { PasswordInput } from "./authParts";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full py-3" disabled={pending}>
      {pending ? "Saving…" : "Reset Password"}
    </button>
  );
}

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState<ResetState, FormData>(
    resetPassword,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-navy">
          New Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          icon={Lock}
        />
      </div>

      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-semibold text-navy">
          Confirm Password
        </label>
        <PasswordInput
          id="confirm"
          name="confirm"
          placeholder="Repeat your new password"
          autoComplete="new-password"
          icon={Lock}
        />
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-slate-500">
        <Link href="/login" className="font-semibold text-primary">
          Back to Log In
        </Link>
      </p>
    </form>
  );
}
