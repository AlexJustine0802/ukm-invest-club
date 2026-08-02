"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import {
  logoutUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/account/actions";
import { getUiIcon } from "@/lib/uiIcons";
import { DUR, EASE } from "@/lib/motion";

export interface TopBarNotification {
  id: string;
  title: string;
  body: string;
  ago: string;
  icon: string | null;
  color: string;
  /** Where clicking the row goes. */
  href: string;
  /** Read rows stay in the list but stop counting towards the bell. */
  read: boolean;
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
  showProfile = true,
}: {
  name: string;
  initial: string;
  role: string;
  notifications: TopBarNotification[];
  /** Off in the mobile nav bar  the profile lives inside the drawer there. */
  showProfile?: boolean;
}) {
  const [open, setOpen] = useState<OpenMenu>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const router = useRouter();

  /**
   * Read state is optimistic: the badge drops the moment a row is clicked, so
   * the count is right while the navigation and the server write are still in
   * flight. The next server render replaces it with the stored truth.
   */
  const [readNow, setReadNow] = useState<string[]>([]);
  const isRead = (n: TopBarNotification) => n.read || readNow.includes(n.id);
  const unread = notifications.filter((n) => !isRead(n));

  async function onNotificationClick(id: string) {
    setOpen(null);
    setReadNow((current) => [...current, id]);
    await markNotificationRead(id);
    router.refresh();
  }

  async function onMarkAllRead() {
    setReadNow(notifications.map((n) => n.id));
    await markAllNotificationsRead();
    router.refresh();
  }

  // Panels scale from their own corner so they read as unfolding out of the
  // button that opened them rather than appearing over it.
  const panel = {
    initial: { opacity: 0, y: -8, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.96 },
    transition: { duration: reduced ? 0 : DUR.ui, ease: EASE },
  };

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
          {unread.length > 0 && (
            // Springs in once on mount, so a newly arrived count draws the eye
            // without pulsing forever afterwards.
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 500, damping: 22 }
              }
              className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white"
            >
              {unread.length}
            </motion.span>
          )}
        </button>

        {/* On mobile the bell sits next to the hamburger, so anchoring the
            panel to the button pushed it off the left edge. Pin it to the
            viewport there; from lg it hangs off the button as before. */}
        <AnimatePresence>
          {open === "notifications" && (
            <motion.div
              {...panel}
              style={{ transformOrigin: "top right" }}
              className="fixed inset-x-3 top-16 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg lg:absolute lg:inset-x-auto lg:right-0 lg:top-auto lg:mt-2 lg:w-80"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-bold text-navy">Notifications</p>
                {unread.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {unread.length} new
                    </span>
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      className="text-[11px] font-semibold text-slate-500 hover:text-primary"
                    >
                      Mark all read
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-semibold text-slate-400">
                    All read
                  </span>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto overscroll-contain">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">
                    No notifications yet.
                  </p>
                ) : (
                  notifications.map((n) => {
                    const Icon = getUiIcon(n.icon);
                    const read = isRead(n);
                    return (
                      <Link
                        key={n.id}
                        href={n.href}
                        onClick={() => onNotificationClick(n.id)}
                        className={`flex gap-3 border-b border-slate-50 px-4 py-3 last:border-0 hover:bg-slate-50 ${
                          read ? "opacity-60" : ""
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${n.color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-sm text-navy ${
                              read ? "font-medium" : "font-semibold"
                            }`}
                          >
                            {n.title}
                          </p>
                          {n.body && (
                            <p className="text-xs text-slate-500">{n.body}</p>
                          )}
                          {n.ago && (
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {n.ago}
                            </p>
                          )}
                        </div>
                        {/* Unread marker, so a read row is still distinguishable
                            once the panel is reopened. */}
                        {!read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </Link>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile */}
      <div className={`relative ${showProfile ? "" : "hidden"}`}>
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
          <motion.span
            animate={{ rotate: open === "profile" ? 180 : 0 }}
            transition={{ duration: reduced ? 0 : DUR.ui, ease: EASE }}
            className="inline-flex"
          >
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </motion.span>
        </button>

        <AnimatePresence>
          {open === "profile" && (
            <motion.div
              {...panel}
              style={{ transformOrigin: "top right" }}
              className="absolute right-0 z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
