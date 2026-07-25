"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { logoutUser } from "@/app/account/actions";
import { getUiIcon } from "@/lib/uiIcons";

export interface TopBarNotification {
  id: string;
  title: string;
  body: string;
  ago: string;
  icon: string | null;
  color: string;
  /** Where clicking the row goes. */
  href: string;
}

const profileMenu: { label: string; icon: LucideIcon; href: string }[] = [
  { label: "My Profile", icon: User, href: "/account/profile" },
  { label: "Settings", icon: Settings, href: "/account/settings" },
  { label: "Help & Support", icon: HelpCircle, href: "/account/help" },
];

type OpenMenu = "notifications" | "profile" | null;

export default function TopBarMenus({
  name,
  initial,
  role,
  notifications,
}: {
  name: string;
  initial: string;
  role: string;
  notifications: TopBarNotification[];
}) {
  const [open, setOpen] = useState<OpenMenu>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(null);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = (menu: OpenMenu) =>
    setOpen((current) => (current === menu ? null : menu));

  return (
    <div ref={wrapRef} className="flex items-center gap-3">
      {/* Notifications */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("notifications")}
          aria-haspopup="menu"
          aria-expanded={open === "notifications"}
          aria-label="Notifications"
          className="relative rounded-lg p-2 hover:bg-slate-100"
        >
          <Bell className="h-5 w-5 text-slate-500" />
          {notifications.length > 0 && (
            <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {notifications.length}
            </span>
          )}
        </button>

        {open === "notifications" && (
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-bold text-navy">Notifications</p>
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {notifications.length} new
              </span>
            </div>
            <div className="max-h-96 overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-400">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((n) => {
                  const Icon = getUiIcon(n.icon);
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setOpen(null)}
                      className="flex gap-3 border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50"
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${n.color}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-navy">{n.title}</p>
                        {n.body && <p className="text-xs text-slate-500">{n.body}</p>}
                        {n.ago && (
                          <p className="mt-0.5 text-[11px] text-slate-400">{n.ago}</p>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          type="button"
          onClick={() => toggle("profile")}
          aria-haspopup="menu"
          aria-expanded={open === "profile"}
          className="flex items-center gap-2 rounded-full hover:opacity-90"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {initial}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>

        {open === "profile" && (
          <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            {/* Head */}
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-base font-bold text-white">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-navy">{name}</p>
                <p className="truncate text-xs text-slate-400">{role}</p>
              </div>
            </div>

            {/* Menu */}
            <div className="py-1">
              {profileMenu.map((m) => (
                <Link
                  key={m.label}
                  href={m.href}
                  onClick={() => setOpen(null)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <m.icon className="h-4 w-4" />
                  {m.label}
                </Link>
              ))}
            </div>

            {/* Logout */}
            <form action={logoutUser} className="border-t border-slate-100">
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
