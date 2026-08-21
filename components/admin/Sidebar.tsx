"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { logout } from "@/app/admin/actions";

type Child = { label: string; href: string };
type Group = { label: string; icon: string; href: string; children?: Child[] };
type WorkspaceId = "public" | "dashboard";

// Public website  mirrors the public navbar (Home, About, Research, Events, Contact).
const publicGroups: Group[] = [
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
    href: "/admin/community",
    children: [
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

// Member dashboard  everything behind the member login at /account.
const dashboardGroups: Group[] = [
  {
    label: "Banner",
    icon: "📢",
    href: "/admin/highlights",
    children: [{ label: "Highlight", href: "/admin/highlights" }],
  },
  {
    label: "Assignments",
    icon: "📝",
    href: "/admin/assignments",
    children: [{ label: "Assignments", href: "/admin/assignments" }],
  },
  {
    label: "Members",
    icon: "🧑‍🎓",
    href: "/admin/members",
    children: [
      { label: "Members & Roles", href: "/admin/members" },
      { label: "Permissions", href: "/admin/members/permissions" },
    ],
  },
  {
    label: "Registrations",
    icon: "🧾",
    href: "/admin/registrations",
    children: [
      { label: "Forms", href: "/admin/registrations" },
      { label: "Recruitment", href: "/admin/recruitment" },
    ],
  },
  {
    label: "Discussions",
    icon: "💬",
    href: "/admin/discussions",
    children: [{ label: "Channels", href: "/admin/discussions" }],
  },
  {
    label: "Career Alerts",
    icon: "💼",
    href: "/admin/career",
    children: [{ label: "Job Postings", href: "/admin/career" }],
  },
  {
    label: "Announcements",
    icon: "📣",
    href: "/admin/announcements",
    children: [{ label: "Announcements", href: "/admin/announcements" }],
  },
  {
    label: "Resources Page",
    icon: "📁",
    href: "/admin/dashboard-content?section=folder",
    children: [
      { label: "Folders", href: "/admin/dashboard-content?section=folder" },
    ],
  },
];

const workspaces: {
  id: WorkspaceId;
  label: string;
  desc: string;
  icon: string;
  home: string;
  groups: Group[];
}[] = [
  {
    id: "public",
    label: "Public Website",
    desc: "Pages any visitor can see",
    icon: "🌐",
    home: "/admin",
    groups: publicGroups,
  },
  {
    id: "dashboard",
    label: "Member Dashboard",
    desc: "Login-only member area",
    icon: "🎓",
    home: "/admin/member-dashboard",
    groups: dashboardGroups,
  },
];

// Routes that belong to the member-dashboard workspace.
const dashboardPrefixes = [
  "/admin/member-dashboard",
  "/admin/highlights",
  "/admin/dashboard-content",
  "/admin/announcements",
  "/admin/assignments",
  "/admin/discussions",
  "/admin/career",
  "/admin/registrations",
  "/admin/recruitment",
  "/admin/members",
];

/**
 * A child is active when the path matches. Children that differ only by query
 * string (?section=…) must also match on that key, otherwise every sibling
 * lights up at once.
 */
function childActive(pathname: string, search: string, href: string) {
  const [path, query] = href.split("?");
  const pathMatches =
    path === "/admin" ? pathname === "/admin" : pathname.startsWith(path);
  if (!pathMatches) return false;
  if (!query) return true;

  const want = new URLSearchParams(query);
  const have = new URLSearchParams(search);
  for (const [key, value] of want) {
    if ((have.get(key) ?? "") !== value) return false;
  }
  return true;
}

export default function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const currentWorkspace: WorkspaceId = dashboardPrefixes.some((p) =>
    pathname.startsWith(p),
  )
    ? "dashboard"
    : "public";

  const workspace =
    workspaces.find((w) => w.id === currentWorkspace) ?? workspaces[0];
  const groups = workspace.groups;

  const isGroupActive = (g: Group) =>
    (g.children ?? []).some((c) => childActive(pathname, search, c.href));

  // Default: the group containing the current route, else the first one.
  const defaultOpen =
    groups.find((g) => isGroupActive(g))?.label ?? groups[0]?.label ?? null;

  // Manual toggles are scoped to a workspace, so switching workspaces falls
  // back to that workspace's default instead of keeping a stale group name
  // (which left every group collapsed and looked like the menu vanished).
  const [override, setOverride] = useState<{
    workspace: WorkspaceId;
    label: string | null;
  } | null>(null);

  const open =
    override && override.workspace === workspace.id
      ? override.label
      : defaultOpen;

  const setOpen = (label: string | null) =>
    setOverride({ workspace: workspace.id, label });
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Mobile drawer. Navigating closes it; so does Escape.
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    const closeTimer = window.setTimeout(() => setDrawerOpen(false), 0);
    return () => window.clearTimeout(closeTimer);
  }, [pathname, search]);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // Close the workspace switcher on outside click or Escape.
  useEffect(() => {
    if (!switcherOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!switcherRef.current?.contains(e.target as Node)) setSwitcherOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSwitcherOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [switcherOpen]);

  const panel = (
    <>
      {/* Workspace switcher */}
      <div ref={switcherRef} className="relative border-b border-white/10">
        <button
          type="button"
          onClick={() => setSwitcherOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={switcherOpen}
          className="flex w-full items-center gap-2 px-6 py-4 text-left text-white hover:bg-white/5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-base">
            {workspace.icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold leading-tight">
              {workspace.label}
            </p>
            <p className="truncate text-xs text-slate-400">Super Admin</p>
          </div>
          <span
            className={`text-xs transition-transform ${switcherOpen ? "rotate-180" : ""}`}
          >
            ▾
          </span>
        </button>

        {switcherOpen && (
          <div className="absolute left-3 right-3 z-50 mt-1 overflow-hidden rounded-xl border border-white/10 bg-navy shadow-xl">
            {workspaces.map((w) => (
              <Link
                key={w.id}
                href={w.home}
                onClick={() => setSwitcherOpen(false)}
                className={`flex items-start gap-3 px-4 py-3 hover:bg-white/10 ${
                  w.id === currentWorkspace ? "bg-white/5" : ""
                }`}
              >
                <span className="mt-0.5 text-base">{w.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{w.label}</p>
                  <p className="text-xs text-slate-400">{w.desc}</p>
                </div>
                {w.id === currentWorkspace && (
                  <span className="text-sm text-primary-light">✓</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        <Link
          href={workspace.id === "public" ? "/admin" : "/admin/member-dashboard"}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            pathname === "/admin" || pathname === "/admin/member-dashboard"
              ? "bg-accent text-white"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <span>📊</span>
          Overview
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
                        childActive(pathname, search, child.href)
                          ? "bg-accent text-white"
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
          href={workspace.id === "dashboard" ? "/account" : "/"}
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <span>🌐</span>
          {workspace.id === "dashboard" ? "View dashboard" : "View site"}
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
    </>
  );

  return (
    <>
      {/* Mobile: a bar with a hamburger, so the nav does not sit on top of
          every page pushing the content down a screenful. */}
      <div className="sticky top-0 z-40 flex items-center gap-2 bg-navy px-4 py-3 text-white md:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
          className="rounded-lg p-2 hover:bg-white/10"
        >
          <span className="text-lg leading-none">☰</span>
        </button>
        <span className="min-w-0 flex-1 truncate text-sm font-bold">
          {workspace.label}
        </span>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-navy text-slate-200 shadow-xl">
            {panel}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-navy text-slate-200 md:flex md:h-screen">
        {panel}
      </aside>
    </>
  );
}
