"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";

/**
 * Fires once when email verification returns here with `?verified=1`.
 *
 * The parameter is stripped after the burst, so a refresh or a back-navigation
 * does not replay the celebration.
 */
export default function SignupCelebration() {
  const router = useRouter();
  const params = useSearchParams();
  const confettiRef = useRef<ConfettiRef>(null);
  const hasCelebrated = useRef(false);
  const [celebrating, setCelebrating] = useState(false);
  const verified = params.get("verified") === "1";

  useEffect(() => {
    if (!verified || hasCelebrated.current) return;

    hasCelebrated.current = true;
    setCelebrating(true);
  }, [verified]);

  useEffect(() => {
    if (!celebrating) return;

    // Fire after the celebrating state renders so the canvas ref is ready.
    confettiRef.current?.fire({
      particleCount: 90,
      spread: 70,
      origin: { x: 0.2, y: 0.9 },
    });
    confettiRef.current?.fire({
      particleCount: 90,
      spread: 70,
      origin: { x: 0.8, y: 0.9 },
    });

    // Keep the verification query long enough for the animation to be seen,
    // then clean it up so a refresh cannot replay the celebration.
    const cleanupTimer = window.setTimeout(() => {
      router.replace("/login", { scroll: false });
    }, 1600);

    return () => window.clearTimeout(cleanupTimer);
  }, [celebrating, router]);

  return (
    <>
      {/* Always mounted, never auto-firing: the canvas has to exist before the
          effect above can fire it. pointer-events-none keeps the form below
          clickable. */}
      <Confetti
        ref={confettiRef}
        manualstart
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      />
      {celebrating && (
        <p className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Email verified  welcome to Parahyangan Finance Club! Log in to get started.
        </p>
      )}
    </>
  );
}
