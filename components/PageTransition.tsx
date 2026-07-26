"use client";

import { useContext, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { DUR, EASE } from "@/lib/motion";

/**
 * The App Router swaps a layout's `children` the moment navigation commits, so
 * by the time AnimatePresence plays an exit the subtree already holds the NEXT
 * page — you'd watch the incoming content fade out and straight back in.
 * Pinning the router context to the value it had when this instance first
 * rendered keeps the outgoing page on screen for the length of its exit.
 *
 * The context is a Next internal, so the null check matters: if a future
 * upgrade moves it, transitions degrade to a plain crossfade instead of
 * crashing the whole app.
 */
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  // useState, not useRef: this value is read during render, and the initialiser
  // captures the context exactly once per keyed instance.
  const [frozen] = useState(context);

  if (!frozen) return <>{children}</>;

  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  // Reduced motion collapses the timing instead of changing the tree, so the
  // page never remounts when the preference resolves after hydration.
  const enter = reduced ? 0 : DUR.page;
  const leave = reduced ? 0 : DUR.pageExit;

  return (
    // initial={false} skips the animation on first paint: the server already
    // rendered the page at its final position, so a hard load shows content
    // immediately (and stays visible if JS never arrives) while client-side
    // navigations still get the full enter and exit.
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        data-page-transition
        // The outgoing page lifts slightly as it fades and the incoming one
        // rises into its place, so a navigation reads as one movement in a
        // single direction rather than a crossfade between two stills.
        initial={{ opacity: 0, y: 24 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: enter, ease: EASE },
        }}
        exit={{
          opacity: 0,
          y: -12,
          transition: { duration: leave, ease: EASE },
        }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
}
