"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function Sidebar({
  menus,
  profile,
}: {
  menus?: React.ReactNode;
  profile?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Navigating closes the drawer; Escape does too.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const navLink = (item: { label: string; icon: LucideIcon; href: string }) => {
    // "/account" is a prefix of every other entry, so it only matches exactly;
    // the rest match sub-routes too (e.g. a channel page under Discussions).
    const active =
      item.href === "/account"
        ? pathname === "/account"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.label}
        href={item.href}
        className={`flex items-center gap-3 rounded-lg py-2.5 pl-3 pr-3 text-sm font-medium ${
          active
            ? "border-l-4 border-primary bg-blue-50 pl-2 text-primary"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        <item.icon className="h-5 w-5" />
        {item.label}
      </Link>
    );
  };

  const logo = (
    <Link href="/account" className="flex items-center px-2 py-2">
      <Image
        src="/images/logo-nobg.png"
        alt="ICU"
        width={280}
        height={112}
        className="h-16 w-auto object-contain lg:h-24"
      />
    </Link>
  );

  const links = (
    <nav className="mt-4 space-y-1 lg:mt-6">
      {nav.map(navLink)}
      <div className="my-3 border-t border-slate-100" />
      {navSecondary.map(navLink)}
    </nav>
  );

  return (
    <>
      {/* Mobile bar — the only way into the menu below lg. */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
        <Link href="/account" className="flex items-center">
          <Image
            src="/images/logo-nobg.png"
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

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col overflow-y-auto bg-white p-4 shadow-xl">
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
            {links}
            {profile}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        {logo}
        {links}
      </aside>
    </>
  );
}
