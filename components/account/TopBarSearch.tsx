"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

/**
 * Search box in the top bar. The query lives in the URL (?q=), so pages can
 * filter on the server and the result stays shareable and back-button safe.
 */
export default function TopBarSearch({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  function push(next: string) {
    const query = new URLSearchParams(params.toString());
    if (next.trim()) query.set("q", next.trim());
    else query.delete("q");
    const qs = query.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        push(value);
      }}
      className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 focus-within:border-primary lg:w-96"
    >
      <Search className="h-4 w-4 shrink-0 text-slate-400" />
      <input
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        // Chrome/Safari draw their own clear button on type="search"; hide it
        // so it does not sit next to ours.
        className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            push("");
          }}
          className="shrink-0 text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
