"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, LoaderCircle } from "lucide-react";
import {
  updateUserPreferences,
  type SettingsActionState,
} from "@/app/account/actions";

type Preferences = {
  notifyAnnouncements: boolean;
  notifyEvents: boolean;
  notifyAssignments: boolean;
  notifyCareer: boolean;
  showPhoto: boolean;
  showSocials: boolean;
};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
    >
      {pending ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" /> Saving…
        </>
      ) : (
        "Save preferences"
      )}
    </button>
  );
}

function PreferenceToggle({
  name,
  label,
  description,
  checked,
}: {
  name: keyof Preferences;
  label: string;
  description: string;
  checked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50">
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-navy">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
      <span className="relative inline-flex h-6 w-11 shrink-0">
        <input
          type="checkbox"
          name={name}
          defaultChecked={checked}
          aria-label={label}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-slate-200 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30 dark:bg-slate-700"
        />
        <span
          aria-hidden="true"
          className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5"
        />
      </span>
    </label>
  );
}

export default function SettingsPreferencesForm(props: Preferences) {
  const [state, action] = useActionState<SettingsActionState, FormData>(
    updateUserPreferences,
    {},
  );

  return (
    <form action={action} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-bold text-navy">Notifications</h3>
        <p className="mt-1 text-sm text-slate-500">
          Choose which updates you want to see in your notification bell.
        </p>
        <div className="mt-5 space-y-3">
          <PreferenceToggle
            name="notifyAnnouncements"
            label="Club announcements"
            description="New announcements and important club updates."
            checked={props.notifyAnnouncements}
          />
          <PreferenceToggle
            name="notifyEvents"
            label="Event reminders"
            description="New and upcoming events from the club."
            checked={props.notifyEvents}
          />
          <PreferenceToggle
            name="notifyAssignments"
            label="Assignment updates"
            description="New assignments, deadlines, and grading updates."
            checked={props.notifyAssignments}
          />
          <PreferenceToggle
            name="notifyCareer"
            label="Career alerts"
            description="New internship, recruitment, and job opportunities."
            checked={props.notifyCareer}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-bold text-navy">Privacy</h3>
        <p className="mt-1 text-sm text-slate-500">
          Control which parts of your member profile are visible to others.
        </p>
        <div className="mt-5 space-y-3">
          <PreferenceToggle
            name="showPhoto"
            label="Show my profile photo"
            description="Display your photo on the public About page."
            checked={props.showPhoto}
          />
          <PreferenceToggle
            name="showSocials"
            label="Show my social links"
            description="Display your Instagram and LinkedIn links on member listings."
            checked={props.showSocials}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton />
        {state.saved && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <Check className="h-4 w-4" /> Preferences saved.
          </span>
        )}
        {state.error && (
          <p className="text-xs font-semibold text-rose-600">{state.error}</p>
        )}
      </div>
    </form>
  );
}
