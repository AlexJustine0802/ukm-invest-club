"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
  href: string;
  /** Null hides the pill; 0 hides it too, so an empty bucket stays quiet. */
  count?: number | null;
}

/**
 * Tab row whose underline slides from the old tab to the new one.
 *
 * The bar is one shared `layoutId`, so framer-motion animates the single
 * element between positions instead of fading one out and another in. It only
 * renders under the active tab — that is what gives it something to travel
 * from.
 */
export default function TabBar({
  tabs,
  active,
  layoutId = "tab-underline",
  accent,
}: {
  tabs: TabItem[];
  active: string;
  /** Unique per tab row on a page, or two rows would share one underline. */
  layoutId?: string;
  /** Tab ids whose count pill is amber rather than blue. */
  accent?: string[];
}) {
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-wrap items-center gap-6 border-b border-slate-200">
      {tabs.map((t) => {
        const isActive = t.id === active;
        return (
          <Link
            key={t.id}
            href={t.href}
            aria-current={isActive ? "page" : undefined}
            className={`relative -mb-px flex items-center gap-2 pb-3 text-sm font-semibold transition-colors ${
              isActive ? "text-primary" : "text-slate-500 hover:text-navy"
            }`}
          >
            {t.label}
            {t.count != null && t.count > 0 && (
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white ${
                  accent?.includes(t.id) ? "bg-amber-500" : "bg-primary"
                }`}
              >
                {t.count}
              </span>
            )}
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
              />
            )}
          </Link>
        );
      })}
    </div>
  );
}
