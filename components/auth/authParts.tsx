"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

const inputBase =
  "w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary";

export function IconInput({
  id,
  name,
  type = "text",
  placeholder,
  autoComplete,
  icon: Icon,
}: {
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        id={id}
        name={name}
        type={type}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={inputBase}
      />
    </div>
  );
}

export function PasswordInput({
  id,
  name,
  placeholder,
  autoComplete,
  icon: Icon,
}: {
  id: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  icon: LucideIcon;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${inputBase} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

// Google / Microsoft "skip ahead" — no real OAuth, just proceed to /account.
export function OAuthButtons() {
  return (
    <>
      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        Or continue with
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/guest"
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-navy hover:bg-slate-50"
        >
          <GoogleMark /> Google
        </Link>
        <Link
          href="/guest"
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-3 text-sm font-medium text-navy hover:bg-slate-50"
        >
          <MicrosoftMark /> Microsoft
        </Link>
      </div>
    </>
  );
}

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.3 5.2C41.4 35.9 44 30.4 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#F25022" d="M0 0h11v11H0z" />
      <path fill="#7FBA00" d="M13 0h11v11H13z" />
      <path fill="#00A4EF" d="M0 13h11v11H0z" />
      <path fill="#FFB900" d="M13 13h11v11H13z" />
    </svg>
  );
}
