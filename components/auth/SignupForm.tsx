"use client";

import Link from "next/link";
import Spinner from "@/components/Spinner";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { User, Mail, Phone, Lock } from "lucide-react";
import { signupUser, type AuthState } from "@/app/signup/actions";
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
      {pending ? "Creating account…" : "Sign Up"}
    </button>
  );
}

export default function SignupForm() {
  const [state, formAction] = useActionState<AuthState, FormData>(
    signupUser,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-semibold text-navy"
        >
          Full Name
        </label>
        <IconInput
          id="name"
          name="name"
          placeholder="Enter your full name"
          autoComplete="name"
          icon={User}
        />
      </div>

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
          htmlFor="phone"
          className="mb-1.5 block text-sm font-semibold text-navy"
        >
          Phone Number
        </label>
        {/* type="tel" gets the numeric keypad on mobile; the real check is in
            the server action, since required/type are trivially bypassed. */}
        <IconInput
          id="phone"
          name="phone"
          type="tel"
          placeholder="e.g. 081234567890"
          autoComplete="tel"
          icon={Phone}
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
          placeholder="Create a password"
          autoComplete="new-password"
          icon={Lock}
        />
        <p className="mt-1.5 text-xs text-slate-400">
          Password must be at least{" "}
          <span className="font-semibold text-primary">8 characters</span>
        </p>
      </div>

      <div>
        <label
          htmlFor="confirm"
          className="mb-1.5 block text-sm font-semibold text-navy"
        >
          Confirm Password
        </label>
        <PasswordInput
          id="confirm"
          name="confirm"
          placeholder="Confirm your password"
          autoComplete="new-password"
          icon={Lock}
        />
      </div>

      <SubmitButton />

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary">
          Log In
        </Link>
      </p>
    </form>
  );
}
