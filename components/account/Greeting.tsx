"use client";

import { useEffect, useState } from "react";
import { greetingFor } from "@/lib/greeting";
import { TypingAnimation } from "@/components/ui/typing-animation";

/**
 * "Good afternoon, Alexander! 👋"  from the *reader's* clock, and kept right
 * while the page stays open.
 *
 * The server renders in its own timezone (UTC in production), which would greet
 * an Indonesian member with the wrong part of the day. Starting from the
 * server's value keeps the first client render identical  no hydration
 * mismatch  and the effect immediately replaces it with local time.
 */
export default function Greeting({
  name,
  initial,
}: {
  name: string;
  /** Server-rendered label, shown until the browser's clock takes over. */
  initial: string;
}) {
  const [label, setLabel] = useState(initial);

  useEffect(() => {
    const tick = () => setLabel(greetingFor());
    tick();
    // A member who leaves the dashboard open should not still read "Good
    // morning" at one o'clock.
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  // The typing restarts whenever its text changes, which here is only when the
  // clock crosses into a new part of the day  `setLabel` with the same string
  // is a no-op, so the minute tick above does not retype anything.
  return (
    <TypingAnimation
      duration={95}
      startOnView={false}
      className="leading-tight tracking-normal"
    >
      {`${label}, ${name}! 👋`}
    </TypingAnimation>
  );
}
