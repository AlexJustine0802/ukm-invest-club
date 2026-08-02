"use client";

import { Suspense, useContext, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { DUR, EASE } from "@/lib/motion";

/**
 * The App Router swaps a layout's `children` the moment navigation commits, so
 * by the time AnimatePresence plays an exit the subtree already holds the NEXT
 * page  you'd watch the incoming content fade out and straight back in.
 * Pinning the router context to the value it had when this instance first
 * rendered keeps the outgoing page on screen for the length of its exit.
 *
 * The context is a Next internal, so the null check matters: if a future
 * upgrade moves it, transitions degrade to a plain crossfade instead of
 * crashing the whole app.
 */
function FrozenRouter({ children }: { children: React.ReactNode }) {
  const context = useContext(LayoutRouterContext);
  const isPresent = useIsPresent();

  /**
   * Freeze only while exiting.
   *
   * Capturing once per instance froze the page for its whole life, not just its
   * exit: a server action calling `revalidatePath` or `router.refresh()` left
   * the URL alone, so nothing remounted and the stale captured context kept
   * being served  the member had to reload by hand to see their submission.
   *
   * While this instance is the live one it passes the real context straight
   * through, and keeps the latest value so the outgoing copy still has the old
   * page to animate away.
   */
  // Adjusted during render rather than in an effect  the same pattern as
  // InlineSearch, and the value is needed on this render, not the next one.
  const [lastLive, setLastLive] = useState(context);
  if (isPresent && lastLive !== context) setLastLive(context);

  const value = isPresent ? context : lastLive;
  if (!value) return <>{children}</>;

  return (
    <LayoutRouterContext.Provider value={value}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

/**
 * `useSearchParams` makes a route client-rendered unless it sits under a
 * Suspense boundary, and this wraps statically built pages too. The fallback is
 * the children themselves, so those pages still ship their content in the HTML
 * and only lose the animation on first paint.
 */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<>{children}</>}>
      <Transition>{children}</Transition>
    </Suspense>
  );
}

function Transition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduced = useReducedMotion();

  /**
   * The query string belongs in the key, not just the path.
   *
   * Tabs and filters navigate to the same pathname with a different `?tab=` or
   * `?category=`. Keyed on pathname alone, AnimatePresence kept the same
   * instance alive, so FrozenRouter below went on serving the router context it
   * captured on first render  the URL changed and the content did not, until a
   * hard reload remounted everything.
   */
  const key = `${pathname}?${searchParams}`;

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
        key={key}
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
