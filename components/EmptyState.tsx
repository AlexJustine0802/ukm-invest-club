import { Inbox } from "lucide-react";

/**
 * Placeholder shown inside a section that has no rows yet.
 *
 * Sections keep their container, heading and reserved height whether the
 * database holds zero records or thousands — this fills the space instead of
 * the section collapsing, which is what caused layout shift before.
 *
 * Same markup the Overview page already used; it lives here so every page
 * renders an identical empty state.
 */
export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[inherit] flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-300">
        <Inbox className="h-5 w-5" />
      </span>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
