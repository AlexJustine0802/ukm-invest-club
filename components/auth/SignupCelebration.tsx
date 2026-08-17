"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Confetti, type ConfettiRef } from "@/components/ui/confetti";

/**
 * Fires once when signup lands here with `?registered=1`.
 *
 * The parameter is stripped straight away, so a reload or a back-navigation
 * does not replay the burst  the same trick the member WelcomeSplash uses.
 */
export default function SignupCelebration() {
  const router = useRouter();
  const params = useSearchParams();
  const confettiRef = useRef<ConfettiRef>(null);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (params.get("registered") !== "1") return;

    setCelebrating(true);
    router.replace("/login", { scroll: false });
    // Two bursts from the bottom corners read better than one from the middle.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          Account created  thanks for signing up! Log in to get started.
        </p>
      )}
    </>
  );
}
