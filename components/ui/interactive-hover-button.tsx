import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * magicui's interactive hover button, adapted three ways:
 *
 * - `bg-background` / `text-primary-foreground` are shadcn tokens this project
 *   does not define, so the colours come from the existing palette instead.
 * - The original expands a visible dot into the fill. This one sweeps a plain
 *   panel in from the left, so nothing shows at rest.
 * - `href` renders a `next/link`, because both places that use it navigate.
 *   A `<button>` inside an `<a>` is invalid HTML, so this cannot be solved by
 *   wrapping at the call site.
 */
export function InteractiveHoverButton({
  children,
  className,
  fillClassName,
  hoverTextClassName,
  href,
  onClick,
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  /** Colour that sweeps in on hover. */
  fillClassName?: string
  /** Label colour once the fill is in place  must contrast with it. */
  hoverTextClassName?: string
  href?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>
}) {
  const content = (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 origin-left scale-x-0 rounded-[inherit] bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100",
          fillClassName
        )}
      />
      <span className="relative inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
        {children}
      </span>
      <span
        className={cn(
          "absolute inset-0 z-10 flex translate-x-12 items-center justify-center gap-2 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100",
          hoverTextClassName
        )}
      >
        {children}
        <ArrowRight className="h-4 w-4" />
      </span>
    </>
  )

  const classes = cn(
    // disabled:pointer-events-none, so a pending submit button cannot be
    // hovered into swapping its own label mid-request.
    "group relative inline-flex h-10 w-auto cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-primary bg-white px-5 text-center text-sm font-semibold text-primary disabled:pointer-events-none disabled:opacity-60",
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    )
  }

  return (
    <button className={classes} onClick={onClick} {...props}>
      {content}
    </button>
  )
}
