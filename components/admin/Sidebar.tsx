"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/admin/actions";

const links = [
  { label: "Dashboard", href: "/admin", icon: "🏠" },
  { label: "Events", href: "/admin/events", icon: "📅" },
  { label: "Publications", href: "/admin/publications", icon: "📄" },
  { label: "Team", href: "/admin/team", icon: "👥" },
  { label: "Gallery", href: "/admin/gallery", icon: "🖼️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

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
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive(link.href)
                ? "bg-gold text-navy"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
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
