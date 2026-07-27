/**
 * The pending indicator for submit buttons.
 *
 * A swapped label alone is easy to miss on a fast connection; a spinner reads
 * as "working" for however long the request actually takes. Decorative, so it
 * is hidden from assistive tech  the disabled button and the changed label
 * already carry that meaning.
 *
 * Coloured for the filled buttons it sits in. Pass border classes to override.
 */
export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`mr-2 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white ${className}`}
    />
  );
}
