import { Search } from "lucide-react";

/**
 * Search box for the public listing pages. A plain GET form: submitting puts
 * the text in ?q= and the page filters on the server, so the result is
 * shareable, works without JavaScript, and needs no client component.
 *
 * `hidden` carries the other active filters (category, tab) through the
 * submit. `page` is deliberately not carried  a new search starts at page 1.
 */
export default function SearchBar({
  action,
  placeholder = "Search...",
  defaultValue = "",
  hidden = {},
}: {
  action: string;
  placeholder?: string;
  defaultValue?: string;
  hidden?: Record<string, string | undefined>;
}) {
  return (
    <form action={action} className="mx-auto flex w-full max-w-md items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm focus-within:border-primary">
      {Object.entries(hidden).map(([name, value]) =>
        value ? <input key={name} type="hidden" name={name} value={value} /> : null,
      )}
      <Search className="h-4 w-4 shrink-0 text-slate-400" />
      <input
        type="text"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm text-navy outline-none placeholder:text-slate-400"
      />
      <button
        type="submit"
        className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
      >
        Search
      </button>
    </form>
  );
}
