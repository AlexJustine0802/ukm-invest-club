"use client";

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

