"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Check } from "lucide-react";
import { InstagramIcon, LinkedInIcon } from "@/components/BrandIcons";
import {
  updateMySocials,
  type ProfileState,
} from "@/app/account/profile/actions";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save links"}
    </button>
  );
}

/** The member's own Instagram and LinkedIn, shown on their member card. */
export default function SocialLinksForm({
  instagram,
  linkedin,
}: {
  instagram: string | null;
  linkedin: string | null;
}) {
  const [state, action] = useActionState<ProfileState, FormData>(
    updateMySocials,
    {},
  );

  const field =
    "w-full rounded-xl border border-slate-200 p-3 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-primary";

  return (
    <form action={action} className="mt-4 space-y-4">
      <div>
        <label
          htmlFor="instagram"
          className="flex items-center gap-2 text-sm font-medium text-slate-600"
        >
          <InstagramIcon className="h-4 w-4" />
          Instagram
        </label>
        <input
          id="instagram"
          name="instagram"
          type="url"
          defaultValue={instagram ?? ""}
          placeholder="https://instagram.com/yourname"
          className={`mt-1 ${field}`}
        />
      </div>

      <div>
        <label
          htmlFor="linkedin"
          className="flex items-center gap-2 text-sm font-medium text-slate-600"
        >
          <LinkedInIcon className="h-4 w-4" />
          LinkedIn
        </label>
        <input
          id="linkedin"
          name="linkedin"
          type="url"
          defaultValue={linkedin ?? ""}
          placeholder="https://linkedin.com/in/yourname"
          className={`mt-1 ${field}`}
        />
      </div>

      {state.error && (
        <p className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.saved && (
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
          <Check className="h-4 w-4" />
          Saved. Other members can see these on your card.
        </p>
      )}

      <Save />
    </form>
  );
}
