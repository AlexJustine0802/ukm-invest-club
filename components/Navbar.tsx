"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { site } from "@/lib/site";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { DUR, EASE } from "@/lib/motion";

export default function Navbar({
  /**
   * Where the logo goes. Signed-in members land on their dashboard; visitors
   * get the public home page.
   */
  homeHref = "/",
}: {
  homeHref?: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  // Flat and transparent while the page is at the top, solid once it moves.
  // Initialised from the current offset so a reload part-way down the page
  // does not flash the transparent state.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-[--dur-ui] ease-[--ease-out] ${
        scrolled || open
          ? "border-slate-200 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between">
        <Link
          href={homeHref}
          className="group relative left-0 flex shrink-0 items-center text-navy md:-left-12"
        >
          <Image
            src="/images/logo_new_txt.png"
            alt={`${site.name} logo`}
            width={156}
            height={100}
            priority
            className="h-10 w-auto shrink-0 object-contain transition-transform duration-[--dur-ui] ease-[--ease-out] group-hover:scale-[1.03] sm:h-12 md:h-14"
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`group/nav relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-slate-600 hover:text-navy"
                }`}
              >
                {item.label}
                {/* Hover preview of the underline: grows from the centre on
                    any inactive link, so the whole bar responds to the pointer
                    rather than only the page you are already on. */}
                {!isActive(item.href) && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-center scale-x-0 rounded-full bg-primary/40 transition-transform duration-[--dur-ui] ease-[--ease-out] group-hover/nav:scale-x-100" />
                )}
                {/* One underline shared across every link via layoutId, so it
                    slides from the old tab to the new one on navigation
                    instead of blinking out here and in over there. */}
                {isActive(item.href) && (
                  <motion.span
                    layoutId={reduced ? undefined : "nav-underline"}
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary"
                    transition={{ duration: DUR.ui, ease: EASE }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <InteractiveHoverButton href="/login" className="rounded-full">
              Login
            </InteractiveHoverButton>
            <InteractiveHoverButton
              href="/signup"
              // Filled variant: blue at rest, sweeps to white on hover, so the
              // label has to flip to blue with it.
              className="rounded-full bg-primary text-white"
              fillClassName="bg-white"
              hoverTextClassName="text-primary"
            >
              Sign Up
            </InteractiveHoverButton>
          </div>
          {/* Mobile toggle */}
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu. Animating grid-template-rows between 0fr and 1fr is what
          lets the panel slide open to its natural height  no measuring, no
          hardcoded max-height that clips longer menus. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ gridTemplateRows: "0fr", opacity: 0 }}
            animate={{ gridTemplateRows: "1fr", opacity: 1 }}
            exit={{ gridTemplateRows: "0fr", opacity: 0 }}
            transition={{ duration: reduced ? 0 : DUR.ui, ease: EASE }}
            className="grid overflow-hidden border-t border-slate-200 bg-white md:hidden"
          >
            <div className="min-h-0">
              <ul className="container-page flex flex-col gap-1 py-3">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`block rounded-md px-3 py-2 text-sm font-medium ${
                        isActive(item.href)
                          ? "bg-primary-light text-primary"
                          : "text-slate-600 hover:bg-slate-50 hover:text-navy"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="mt-2 flex gap-2">
                  <InteractiveHoverButton
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-full"
                  >
                    Login
                  </InteractiveHoverButton>
                  <InteractiveHoverButton
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-full bg-primary text-white"
                    fillClassName="bg-white"
                    hoverTextClassName="text-primary"
                  >
                    Sign Up
                  </InteractiveHoverButton>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
