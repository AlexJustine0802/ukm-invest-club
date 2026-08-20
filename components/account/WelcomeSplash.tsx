"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { site } from "@/lib/site";
import { EASE } from "@/lib/motion";
import { TypingAnimation } from "@/components/ui/typing-animation";

/** Before the first character is typed. Matches the greeting's fade-in. */
const TEXT_DELAY_MS = 700;
/** Per character, same value passed to TypingAnimation below. */
const TYPE_MS = 95;
/** Beat between the last character and the fade-out. */
const PAUSE_AFTER_TYPING_MS = 1000;

/**
 * The curtain shown once, straight after signing in.
 *
 * It is keyed off `?welcome=1`, which the login action adds to its redirect,
 * and the parameter is stripped as soon as the splash starts  so a reload, a
 * bookmark, or navigating back to the dashboard never replays it.
 */
export default function WelcomeSplash({ name }: { name: string }) {
  const router = useRouter();
  const reduced = useReducedMotion();

  const [showing, setShowing] = useState(false);

  const firstName = name.split(" ")[0];
  const message = `Hello, ${firstName}. Welcome back!`;
  // Derived, not a hand-tuned constant: a longer name types for longer, and the
  // pause after the last character stays the same either way.
  const holdMs =
    TEXT_DELAY_MS +
    Array.from(message).length * TYPE_MS +
    PAUSE_AFTER_TYPING_MS;

  // Read inside a mount-only effect, so they cannot re-trigger it.
  const holdRef = useRef(holdMs);
  const reducedRef = useRef(reduced);
  holdRef.current = holdMs;
  reducedRef.current = reduced;

  // Mount-only, and the flag is read from the URL rather than useSearchParams.
  // With `params` in the dependency list this effect re-ran the moment the
  // replace() below rewrote the URL; its cleanup cancelled the timer that hides
  // the splash, and the curtain stayed up forever.
  useEffect(() => {
    const isWelcome =
      new URLSearchParams(window.location.search).get("welcome") === "1";
    if (!isWelcome) return;

    // Drop the parameter immediately: the splash owns its own lifetime from
    // here, and the URL should be clean if the member reloads mid-animation.
    router.replace(window.location.pathname, { scroll: false });

    if (reducedRef.current) return;

    setShowing(true);
    const id = window.setTimeout(() => setShowing(false), holdRef.current);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {showing && (
        <motion.div
          key="welcome-splash"
          // aria-hidden: the greeting is decorative and the dashboard behind it
          // is already announced; a screen reader should not wait on this.
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          // Inline colours, not utilities: the member area's dark theme remaps
          // .bg-white / .from-white / .text-navy globally, and this curtain is
          // meant to read the same in both themes. Inline wins over those rules.
          style={{
            backgroundImage:
              "linear-gradient(to bottom right, #ffffff, #f8fafc, #DCE9FF)",
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            <Image
              src="/images/logo_new_notxt.png"
              alt={`${site.name} logo`}
              width={260}
              height={104}
              priority
              className="h-20 w-auto object-contain sm:h-24"
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
            style={{ color: "#1E293B" }}
            className="px-6 text-center text-2xl font-extrabold sm:text-3xl"
          >
            <TypingAnimation
              duration={TYPE_MS}
              delay={TEXT_DELAY_MS}
              startOnView={false}
            >
              {message}
            </TypingAnimation>
          </motion.p>

          {/* A progress hairline, so the pause reads as loading rather than a
              frozen screen. */}
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: holdMs / 1000, ease: "linear" }}
            style={{ backgroundColor: "rgba(20, 77, 200, 0.6)" }}
            className="h-0.5 w-40 origin-left rounded-full"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
