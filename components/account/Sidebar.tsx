"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DUR, EASE } from "@/lib/motion";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Home,
  FolderClosed,
  ClipboardList,
  Ticket,
  MessageSquare,
  CalendarDays,
  ClipboardCheck,
  Users,
  Briefcase,
  Settings,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

const nav: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Dashboard", icon: Home, href: "/account" },
  { label: "Resources", icon: FolderClosed, href: "/account/resources" },
  { label: "Assignments", icon: ClipboardList, href: "/account/assignments" },
  { label: "Events", icon: Ticket, href: "/account/events" },
  { label: "Discussions", icon: MessageSquare, href: "/account/discussions" },
  { label: "Calendar", icon: CalendarDays, href: "/account/calendar" },
  { label: "Recruitment", icon: ClipboardCheck, href: "/account/recruitment" },
];

const navSecondary: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "Members", icon: Users, href: "/account/members" },
  { label: "Career Alert", icon: Briefcase, href: "/account/career" },
];

// Shown only to members whose role has admin permissions. It opens the admin
// workspace inside this same chrome  the sidebar stays put and only the
// content area changes  so it belongs in the nav, below its own divider.
const navAdmin = { label: "Admin", icon: Settings, href: "/admin" };

export default function Sidebar({
  menus,
  profile,
  showAdmin = false,
}: {
  menus?: React.ReactNode;
  profile?: React.ReactNode;
  /** True when this member's role has been granted admin permissions. */
  showAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  // Navigating closes the drawer; Escape does too.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // The drawer and the desktop sidebar are both mounted at once, so each gets
  // its own layoutId  one shared id across two live copies would make the
  // indicator try to fly between them.
  // Takes both arguments rather than currying: a function that returns JSX
  // from one argument reads as a component to lint rules, and this is a render
  // helper, not a component.
  const navLink = (
    scope: string,
    item: { label: string; icon: LucideIcon; href: string },
  ) => {
    // "/account" is a prefix of every other entry, so it only matches
    // exactly; the rest match sub-routes too (e.g. a channel page under
    // Discussions).
    const active =
      item.href === "/account"
        ? pathname === "/account"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.label}
        href={item.href}
        className={`group relative flex items-center gap-3 rounded-lg py-2.5 pl-3 pr-3 text-sm font-medium transition-colors duration-[--dur-hover] ${
          active
            ? "bg-blue-50 text-primary"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        {/* Was a 4px left border with the padding shaved to match, which
              nudged the label sideways on every navigation. Positioned
              absolutely it costs no layout, so the text never moves  and
              layoutId slides it from the old item to the new one. */}
        {active && (
          <motion.span
            layoutId={reduced ? undefined : `account-nav-${scope}`}
            className="absolute inset-y-1 left-0 w-1 rounded-r-full bg-primary"
            transition={{ duration: DUR.ui, ease: EASE }}
          />
        )}
        <item.icon className="h-5 w-5 transition-transform duration-[--dur-hover] ease-[--ease-out] group-hover:scale-110" />
        {item.label}
      </Link>
    );
  };

  const logo = (
    <Link href="/account" className="flex items-center px-10 py-2">
      <Image
        src="/images/logo_new_notxt.png"
        alt="ICU"
        width={280}
        height={112}
        className="h-16 w-auto object-contain lg:h-20"
      />
    </Link>
  );

  const links = (scope: string) => (
    <nav className="mt-4 space-y-1 lg:mt-6">
      {nav.map((item) => navLink(scope, item))}
      <div className="my-3 border-t border-slate-100" />
      {navSecondary.map((item) => navLink(scope, item))}
      {showAdmin && (
        <>
          <div className="my-3 border-t border-slate-100" />
          {navLink(scope, navAdmin)}
        </>
      )}
    </nav>
  );

  return (
    <>
      {/* Mobile bar  the only way into the menu below lg. */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
        <Link href="/account" className="flex items-center">
          <Image
            src="/images/logo_new_notxt.png"
            alt="ICU"
            width={280}
            height={112}
            className="h-10 w-auto object-contain"
          />
        </Link>
        <div className="flex items-center gap-1">
          {menus}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile drawer. The scrim fades while the panel slides, so the page
          behind dims as the menu arrives rather than after it. */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : DUR.ui, ease: EASE }}
              className="absolute inset-0 bg-navy/40"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: reduced ? 0 : DUR.ui, ease: EASE }}
              className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col overflow-y-auto bg-white p-4 shadow-xl"
            >
              <div className="flex items-start justify-between">
                {logo}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {links("drawer")}
              {profile}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        {logo}
        {links("desktop")}
      </aside>
    </>
  );
}
