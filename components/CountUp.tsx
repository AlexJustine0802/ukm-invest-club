"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { DUR } from "@/lib/motion";

/**
 * Counts a statistic up when it scrolls into view, once.
 *
 * Stat values are admin-typed strings like "150+", "1.2k" or "Top 3", so the
 * leading number is animated and everything around it is passed through
 * untouched. Anything without a leading number renders as-is  no parsing
 * surprises on the page.
 */
export default function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();

  const match = /^(\D*)(\d[\d,]*)(.*)$/.exec(value.trim());
  const target = match ? Number(match[2].replace(/,/g, "")) : null;

  const [n, setN] = useState(0);

  useEffect(() => {
    if (target === null || !inView) return;

    let raf = 0;

    if (reduced) {
      // Jump to the final figure, but on the next frame rather than
      // synchronously inside the effect.
      raf = requestAnimationFrame(() => setN(target));
      return () => cancelAnimationFrame(raf);
    }

    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / DUR.count, 1);
      // easeOutQuad, deliberately gentler than the shared EASE curve used for
      // movement. Quint reaches 99% of the value at 60% of the time, which
      // parks the digits on the final figure while two fifths of the duration
      // is still running; quad keeps them climbing for ~90% of it, so the
      // count reads as long as it actually is.
      setN(Math.round(target * (1 - Math.pow(1 - t, 2))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, reduced]);

  // No leading number  nothing to count, so show the value verbatim.
  if (target === null || !match) return <span ref={ref}>{value}</span>;

  // tabular-nums fixes every digit to the same advance width, so the figure
  // does not jitter as it counts. The stat values sit in their own block-level
  // <p>, so the width growing from "0" to "350+" moves nothing beside them.
  return (
    <span ref={ref} className="tabular-nums">
      {match[1]}
      {n.toLocaleString()}
      {match[3]}
    </span>
  );
}
