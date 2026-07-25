"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

/**
 * Icon button that expands into a search box. The query lives in ?q= so the
 * page can filter on the server and the result stays shareable.
 *
 * The ✕ resets what you typed; clicking outside (or Escape) closes the box.
 */
export default function InlineSearch({
  placeholder = "Search...",
}: {
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const query = params.get("q") ?? "";

  const [open, setOpen] = useState(Boolean(query));
  const [value, setValue] = useState(query);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the box in step when the URL changes (back button, reset links).
  // Adjusted during render rather than in an effect, which would cause a
  // second render pass — see react.dev "You Might Not Need an Effect".
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setValue(query);
  }

  // Close on outside click or Escape. Any active filter stays applied — the
  // button shows as active so it is clear the list is still filtered.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function push(next: string) {
    const params2 = new URLSearchParams(params.toString());
    if (next.trim()) params2.set("q", next.trim());
    else params2.delete("q");
    const qs = params2.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  if (!open) {
    const filtering = Boolean(query);
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={placeholder}
        aria-expanded={false}
        title={filtering ? `Filtered by “${query}”` : placeholder}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
          filtering
            ? "border-primary bg-primary text-white"
            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
        }`}
      >
        <Search className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div ref={wrapRef}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          push(value);
        }}
        className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 focus-within:border-primary"
      >
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          ref={inputRef}
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-32 bg-transparent text-sm text-navy outline-none placeholder:text-slate-400 sm:w-44"
        />
        {(value || query) && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setValue("");
              if (query) push("");
              inputRef.current?.focus();
            }}
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>
    </div>
  );
}
