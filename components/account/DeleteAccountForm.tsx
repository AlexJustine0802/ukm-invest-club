"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertTriangle, LoaderCircle, Trash2 } from "lucide-react";
import {
  deleteMyAccount,
  type SettingsActionState,
} from "@/app/account/actions";

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60"
    >
      {pending ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" /> Deleting…
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4" /> Delete account
        </>
      )}
    </button>
  );
}

export default function DeleteAccountForm() {
  const [confirming, setConfirming] = useState(false);
  const [state, action] = useActionState<SettingsActionState, FormData>(
    deleteMyAccount,
    {},
  );

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
      >
        <Trash2 className="h-4 w-4" /> Delete account
      </button>
    );
  }

  return (
    <form action={action} className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-900 dark:bg-rose-950/30">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">Confirm account deletion</p>
          <p className="mt-1 text-xs leading-5 text-rose-700 dark:text-rose-300">
            This permanently removes your account, registrations, submissions, and profile data.
            Enter your current password to continue.
          </p>
          <label className="mt-4 block text-xs font-semibold text-rose-800 dark:text-rose-200" htmlFor="delete-account-password">
            Current password
          </label>
          <input
            id="delete-account-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 w-full max-w-sm rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-navy outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 dark:border-rose-800 dark:bg-slate-900 dark:text-white"
          />
          {state.error && <p className="mt-2 text-xs font-semibold text-rose-700 dark:text-rose-300">{state.error}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <DeleteButton />
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
