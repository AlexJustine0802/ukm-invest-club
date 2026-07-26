"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, Inbox } from "lucide-react";
import { getUiIcon } from "@/lib/uiIcons";

export interface UpdateItem {
  id: string;
  label: string;
  /** Shown as a badge; 0 renders no badge. */
  count: number;
  href: string;
  /** Key from lib/uiIcons, so the icon style matches the rest of the app. */
  icon: string;
  /** Tailwind classes for the icon chip, e.g. "bg-blue-50 text-primary". */
  color: string;
}

/**
 * Mobile-only summary of the dashboard's side widgets, collapsed by default so
 * the greeting and hero stay where they are on first paint.
 *
 * The accordion animates grid-template-rows 0fr → 1fr rather than a fixed
 * max-height, so the transition is smooth whatever the content height is and
 * nothing is clipped at the end of it.
 */
export default function LatestUpdates({ items }: { items: UpdateItem[] }) {
  const [open, setOpen] = useState(false);
  const total = items.reduce((sum, i) => sum + i.count, 0);

  return (
    <div className="mb-6 md:hidden">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
        >
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-navy">
            Latest Updates
          </span>
          {total > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-white">
              {total}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-2 border-t border-slate-100 p-3">
              {total === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                    <Inbox className="h-5 w-5" />
                  </span>
                  <p className="text-sm text-slate-400">
                    You&rsquo;re all caught up. No updates available.
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const Icon = getUiIcon(item.icon);
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-navy">
                        {item.label}
                      </span>
                      {item.count > 0 && (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 px-1.5 text-[11px] font-bold text-primary">
                          {item.count}
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
