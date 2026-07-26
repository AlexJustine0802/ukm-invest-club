"use client";

import { useActionState } from "react";
import Spinner from "@/components/Spinner";
import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import {
  submitContact,
  type ContactFormState,
} from "@/app/(site)/contact/actions";

const initialState: ContactFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary px-6" disabled={pending}>
      {pending ? <Spinner /> : <Send className="mr-2 h-4 w-4" />}
      {pending ? "Sending..." : "Send Message"}
    </button>
  );
}

function LinkText({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className="font-bold text-primary hover:text-primary-dark">
      {children}
    </a>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-success/30 bg-success/10 p-6 text-center">
        <p className="font-semibold text-navy">Message sent!</p>
        <p className="mt-1 text-sm text-slate-600">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.status === "error" && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

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
            Your Name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="Enter your full name"
            className="input min-h-12"
          />
        </div>
        <div>
          <label htmlFor="email" className="label">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="Enter your email"
            className="input min-h-12"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="label">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          required
          placeholder="What is this regarding?"
          className="input min-h-12"
        />
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
          placeholder="Write your message here..."
          className="input resize-y"
        />
      </div>

      <label className="flex items-start gap-2 text-sm font-medium text-navy">
        <input
          type="checkbox"
          required
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
        />
        <span>
          I agree to the <LinkText href="/contact">terms</LinkText> and{" "}
          <LinkText href="/contact">privacy policy</LinkText>.
        </span>
      </label>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
