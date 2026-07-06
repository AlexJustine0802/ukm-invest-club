"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type ContactFormState } from "@/app/(site)/contact/actions";

const initialState: ContactFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary w-full" disabled={pending}>
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-xl border border-success/30 bg-success/10 p-6 text-center">
        <div className="text-4xl">✅</div>
        <p className="mt-3 font-semibold text-navy">Message sent!</p>
        <p className="mt-1 text-sm text-slate-600">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      {/* Honeypot (hidden from users) */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">
            Name
          </label>
          <input id="name" name="name" required className="input" />
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="label">
          Subject
        </label>
        <input id="subject" name="subject" required className="input" />
      </div>

      <div>
        <label htmlFor="message" className="label">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          className="input resize-y"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
