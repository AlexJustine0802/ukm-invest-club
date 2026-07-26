"use client";

import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE } from "@/lib/motion";

/**
 * Fades a section up as it scrolls into view, once.
 *
 * `as` exists so the reveal can *replace* the element it animates instead of
 * wrapping it — passing the original tag and classes through keeps the DOM
 * identical to what it was before, which is what stops the effect from moving
 * anything. Only opacity and transform animate, so it can never shift layout.
 */
const TAGS = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  footer: motion.footer,
  li: motion.li,
} as const;

export default function Reveal({
  children,
  as = "div",
  className,
  id,
  delay = 0,
}: {
  children: React.ReactNode;
  as?: keyof typeof TAGS;
  className?: string;
  /** Kept so sections that are anchor targets (e.g. #community) still are. */
  id?: string;
  /** Small offset for revealing two or three siblings in sequence. */
  delay?: number;
}) {
  const Tag = TAGS[as];
  const reduced = useReducedMotion();

  return (
    <Tag
      // Paired with the <noscript> rule in the root layout: without scripting
      // the element would otherwise stay at the initial opacity: 0 forever.
      data-reveal
      id={id}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      // Fires a touch before the section is fully on screen, so the motion has
      // finished by the time it is properly in view rather than starting then.
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -8% 0px" }}
      transition={{
        duration: reduced ? 0 : DUR.reveal,
        ease: EASE,
        delay: reduced ? 0 : delay,
      }}
    >
      {children}
    </Tag>
  );
}
