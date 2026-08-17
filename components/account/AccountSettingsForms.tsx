"use client";

import { useState, useTransition } from "react";
import { MailCheck } from "lucide-react";
import {
  requestEmailVerification,
  type ProfileState,
} from "@/app/account/profile/actions";

/**
 * Send yourself a confirmation link.
 *
 * Not a plain form action because the button sits inside the email row rather
 * than owning it  the address comes from the session on the server anyway.
 */
export function VerifyEmailButton() {
  const [state, setState] = useState<ProfileState>({});
  const [pending, startTransition] = useTransition();

  return (
    <div className="shrink-0 text-right">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => setState(await requestEmailVerification()))
        }
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-blue-50 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Verify email"}
      </button>
      {state.sent && (
        <p className="mt-1 flex items-center justify-end gap-1 text-[11px] font-semibold text-emerald-600">
          <MailCheck className="h-3.5 w-3.5" />
          Link sent  check your inbox.
        </p>
      )}
      {state.error && (
        <p className="mt-1 text-[11px] font-semibold text-rose-600">
          {state.error}
        </p>
      )}
    </div>
  );
}
