"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { site } from "@/lib/site";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="relative -left-12 flex items-center text-navy">
          <Image
            src="/images/logo-nobg.png"
            alt={`${site.name} logo`}
            width={156}
            height={100}
            priority
            className="h-20 w-auto shrink-0 object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-slate-600 hover:text-navy"
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className="hidden btn-primary md:inline-flex"
          >
            Join Us
          </Link>
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

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
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
            <li>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="btn-primary mt-2 w-full"
              >
                Join Us
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
