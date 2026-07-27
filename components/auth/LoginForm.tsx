"use client";

import Link from "next/link";
import Spinner from "@/components/Spinner";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Mail, Lock } from "lucide-react";
import { loginUser } from "@/app/login/actions";
import type { AuthState } from "@/app/signup/actions";
import { IconInput, PasswordInput } from "./authParts";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="btn-primary w-full py-3"
      disabled={pending}
    >
      {pending && <Spinner />}
      {pending ? "Logging in…" : "Log In"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(
    loginUser,
    {},
  );
  const params = useSearchParams();
  const reset = params.get("reset") === "1";

  return (
    <form action={formAction} className="space-y-5">
      {reset && !state.error && (
        <p className="rounded-lg bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Password updated  please log in.
        </p>
      )}
      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-semibold text-navy"
        >
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

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-semibold text-navy"
        >
          Password
        </label>
        <PasswordInput
          id="password"
          name="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          icon={Lock}
        />
        <div className="mt-2 text-right">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-primary">
          Join ICU
        </Link>
      </p>
    </form>
  );
}
