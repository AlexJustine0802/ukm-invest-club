"use client";

import { Children } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE } from "@/lib/motion";

/**
 * Reveals a grid's cards one after another instead of as a single block.
 *
 * Each child gets wrapped in its own animated box, so the wrapper — not the
 * card — becomes the grid item. `h-full` on the wrapper plus `[&>*]:h-full` on
 * the card inside preserves the equal-height rows that grid stretching used to
 * give for free; without both, a row of cards ends up ragged.
 */
export default function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const step = reduced ? 0 : DUR.stagger;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -8% 0px" }}
      variants={{ show: { transition: { staggerChildren: step } } }}
    >
      {Children.map(children, (child) => (
        <motion.div
          data-reveal
          className="h-full min-w-0 [&>*]:h-full"
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: {
              opacity: 1,
              y: 0,
              transition: { duration: reduced ? 0 : DUR.item, ease: EASE },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
