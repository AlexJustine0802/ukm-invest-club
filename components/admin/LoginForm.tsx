"use client";

import { useActionState } from "react";
import Spinner from "@/components/Spinner";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "@/app/admin/login/actions";

const initialState: LoginState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending && <Spinner />}
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginForm({ from }: { from: string }) {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="from" value={from} />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="username" className="label">
          Username
        </label>
        <input
          id="username"
          name="username"
          required
          autoComplete="username"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="password" className="label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
