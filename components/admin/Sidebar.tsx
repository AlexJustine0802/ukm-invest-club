"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";

type Child = { label: string; href: string };
type Group = { label: string; icon: string; href: string; children?: Child[] };

// 5 groups mirroring the public navbar (Home, About, Research, Events, Contact).
const groups: Group[] = [
  {
    label: "Home",
    icon: "🏠",
    href: "/admin",
    children: [
      { label: "Image", href: "/admin/hero-slides?loc=home" },
      { label: "Impact Stats", href: "/admin/impact-stats" },
    ],
  },
  {
    label: "About",
    icon: "ℹ️",
    href: "/admin/team",
    children: [
      { label: "Team", href: "/admin/team" },
      { label: "Community", href: "/admin/community" },
      { label: "Partners", href: "/admin/partners" },
    ],
  },
  {
    label: "Research",
    icon: "📄",
    href: "/admin/publications",
    children: [
      { label: "Publications", href: "/admin/publications" },
      { label: "Research Categories", href: "/admin/research-categories" },
      { label: "Hero Slides", href: "/admin/publications/featured" },
      { label: "Research Stats", href: "/admin/impact-stats?section=research" },
    ],
  },
  {
    label: "Events",
    icon: "📅",
    href: "/admin/events",
    children: [
      { label: "Events", href: "/admin/events" },
      { label: "Event Categories", href: "/admin/event-categories" },
      { label: "Hero Slides", href: "/admin/events/featured" },
    ],
  },
  {
    label: "Contact",
    icon: "✉️",
    href: "/contact",
    children: [{ label: "View Contact Page", href: "/contact" }],
  },
];

// A child is active if the current path starts with its route (ignoring query).
function childActive(pathname: string, href: string) {
  const path = href.split("?")[0];
  return path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);
}

export default function Sidebar() {
  const pathname = usePathname();

  const isGroupActive = (g: Group) =>
    (g.children ?? []).some((c) => childActive(pathname, c.href));

  // Open the group that contains the active route by default.
  const [open, setOpen] = useState<string | null>(
    groups.find((g) => isGroupActive(g))?.label ?? "Home",
  );

  return (
    <aside className="flex w-full flex-col bg-navy text-slate-200 md:h-screen md:w-64 md:shrink-0">
      <div className="flex items-center gap-2 border-b border-white/10 px-6 py-4 text-white">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold font-bold text-navy">
          IC
        </span>
        <div>
          <p className="text-sm font-bold leading-none">ICUnpar</p>
          <p className="text-xs text-slate-400">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <Link
          href="/admin"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            pathname === "/admin"
              ? "bg-gold text-navy"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span>📊</span>
          Dashboard
        </Link>

        {groups.map((group) => {
          const expanded = open === group.label;
          const active = isGroupActive(group);
          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : group.label)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{group.icon}</span>
                <span className="flex-1 text-left">{group.label}</span>
                <span
                  className={`text-xs transition-transform ${expanded ? "rotate-90" : ""}`}
                >
                  ›
                </span>
              </button>

              {expanded && group.children && (
                <div className="mt-1 space-y-1 pl-6">
                  {group.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center rounded-lg px-3 py-1.5 text-sm transition-colors ${
                        childActive(pathname, child.href)
                          ? "bg-gold text-navy"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <span>🌐</span> View site
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <span>🚪</span> Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
