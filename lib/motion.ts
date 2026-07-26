/**
 * The single source of truth for how motion feels across the app.
 *
 * Framer Motion components import these; app/globals.css mirrors the same
 * numbers as CSS variables for the hover and press transitions. Change a value
 * here and in globals.css together — that pairing is what keeps a CSS hover
 * and a JS reveal reading as the same product.
 */

/**
 * Ease-out-quint. Framer's built-in "easeOut" is cubic-bezier(0, 0, 0.58, 1),
 * which decelerates late and reads as mechanical. This one sheds most of its
 * speed early and drifts into place, which is what makes a long animation feel
 * unhurried instead of slow.
 */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Seconds, except `count` which is milliseconds (it drives a rAF loop).
 *
 * Content arriving is deliberately unhurried; anything responding to a click
 * or a pointer is not. Slowing hover feedback reads as lag, not elegance, so
 * `hover` and `ui` stay short while the load animations stretch out.
 */
export const DUR = {
  /** Pointer feedback. Long enough to glide, short enough to feel direct. */
  hover: 0.24,
  /** Dropdowns, menus, disclosure. */
  ui: 0.32,
  /** Page enter. */
  page: 0.6,
  /**
   * Page exit — deliberately quicker than the enter. Waiting on an outgoing
   * page is dead time; the incoming one is what should feel generous.
   */
  pageExit: 0.3,
  /** Section scroll reveal. */
  reveal: 1,
  /** A single card inside a staggered grid. */
  item: 0.85,
  /** Gap between consecutive cards in a grid. */
  stagger: 0.12,
  /**
   * Statistic count-up, in milliseconds.
   *
   * Read together with the easing in CountUp.tsx: a counter's perceived length
   * is how long the digits keep changing, not the nominal duration. A sharp
   * ease-out lands on the final figure early and spends the remainder
   * invisibly, so this pairs with a gentle curve there.
   */
  count: 3000,
} as const;
