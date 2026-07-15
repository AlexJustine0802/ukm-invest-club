import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Home,
  BookOpen,
  FolderClosed,
  ClipboardList,
  Megaphone,
  Calendar,
  Users,
  MessageSquare,
  Settings,
  HelpCircle,
  Search,
  Bell,
  ChevronDown,
  FileText,
  MoreVertical,
  BarChart3,
  Landmark,
  PieChart,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { getUserSession } from "@/lib/userAuth";
import { logoutUser } from "./actions";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const nav: { label: string; icon: LucideIcon; href: string; active?: boolean }[] = [
  { label: "Home", icon: Home, href: "/account", active: true },
  { label: "Classes", icon: BookOpen, href: "/publications" },
  { label: "Materials", icon: FolderClosed, href: "/publications" },
  { label: "Assignments", icon: ClipboardList, href: "/events" },
  { label: "Announcements", icon: Megaphone, href: "/events" },
  { label: "Calendar", icon: Calendar, href: "/events" },
  { label: "Members", icon: Users, href: "/about" },
  { label: "Discussions", icon: MessageSquare, href: "/community" },
];

// Sample content (no data source yet).
const classes = [
  { name: "Investment 101", track: "Beginner Track", desc: "Introduction to investing, key concepts, and market basics.", materials: 12, members: 45, icon: BarChart3, color: "bg-blue-500" },
  { name: "Financial Statement Analysis", track: "Intermediate Track", desc: "Learn how to read and analyze financial statements.", materials: 18, members: 38, icon: Landmark, color: "bg-emerald-500" },
  { name: "Portfolio Management", track: "Advanced Track", desc: "Build and manage a portfolio like a pro.", materials: 14, members: 32, icon: PieChart, color: "bg-violet-500" },
];

const announcements = [
  { icon: Megaphone, title: "New Material Available!", body: "Check out the latest material on Risk Management.", ago: "2 hours ago", color: "bg-blue-50 text-primary" },
  { icon: Calendar, title: "Live Session Reminder", body: "Don't forget our Macroeconomics Discussion this Saturday!", ago: "1 day ago", color: "bg-emerald-50 text-emerald-600" },
  { icon: Megaphone, title: "ICU Monthly Update", body: "See what's new in ICU this month!", ago: "3 days ago", color: "bg-amber-50 text-amber-600" },
];

export default async function AccountPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user =
    session.userId === "guest"
      ? null
      : await prisma.user.findUnique({ where: { id: session.userId } });

  const displayName = user?.name ?? "Guest";
  const firstName = displayName.split(" ")[0];
  const initial = displayName.charAt(0).toUpperCase();
  const now = new Date();

  const [materials, upcoming] = await Promise.all([
    prisma.publication.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        publishedAt: true,
        category: { select: { title: true } },
      },
    }),
    prisma.event.findMany({
      where: { published: true, eventDate: { gte: now } },
      orderBy: { eventDate: "asc" },
      take: 3,
      select: { id: true, title: true, eventDate: true },
    }),
  ]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-navy">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <Link href="/" className="flex items-center gap-2 px-2 py-2">
          <Image
            src="/images/logo-nobg.png"
            alt="ICU"
            width={160}
            height={64}
            className="h-10 w-auto object-contain"
          />
        </Link>

        <nav className="mt-6 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                item.active
                  ? "bg-blue-50 text-primary"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
          <div className="my-3 border-t border-slate-100" />
          <Link
            href="/contact"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <HelpCircle className="h-5 w-5" />
            Help &amp; Support
          </Link>
          <form action={logoutUser}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <LogOut className="h-5 w-5" />
              Log Out
            </button>
          </form>
        </nav>

        <div className="mt-auto rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-bold text-navy">Stay Updated!</p>
          <p className="mt-1 text-xs text-slate-500">
            Enable notifications to never miss any updates from ICU.
          </p>
          <div className="mt-3 rounded-lg border border-primary py-2 text-center text-xs font-semibold text-primary">
            Enable Notifications
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 p-6 lg:p-8">
        {/* Top bar */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">Hello, {firstName}! 👋</h1>
            <p className="mt-1 text-sm text-slate-500">
              Ready to learn, invest, and make an impact today?
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-400 lg:w-80">
              <Search className="h-4 w-4" />
              Search for materials, classes, etc...
            </div>
            <div className="relative rounded-lg border border-slate-200 bg-white p-2">
              <Bell className="h-5 w-5 text-slate-500" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                3
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-navy px-2 py-1.5 pr-3 text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold">
                {initial}
              </span>
              <span className="text-sm font-semibold">{displayName}</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Welcome banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy to-primary-dark p-8 text-white">
              <div className="relative max-w-md">
                <h2 className="text-2xl font-bold">Welcome back to ICU!</h2>
                <p className="mt-2 text-sm text-blue-100">
                  Explore new materials, continue your learning, and grow
                  together with the community.
                </p>
                <Link
                  href="/publications"
                  className="mt-5 inline-block rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary"
                >
                  See What&apos;s New
                </Link>
              </div>
              <div className="absolute right-6 top-6 hidden h-40 w-56 rounded-xl bg-white/10 sm:block" />
            </div>

            {/* Your Classes */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-navy">Your Classes</h3>
                <Link href="/publications" className="text-sm font-semibold text-primary">
                  View All Classes
                </Link>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {classes.map((c) => (
                  <div key={c.name} className="rounded-xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-lg text-white ${c.color}`}>
                        <c.icon className="h-6 w-6" />
                      </span>
                      <MoreVertical className="h-4 w-4 text-slate-400" />
                    </div>
                    <p className="mt-4 font-bold text-navy">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.track}</p>
                    <p className="mt-3 text-sm text-slate-500">{c.desc}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <FolderClosed className="h-3.5 w-3.5" />
                        {c.materials} Materials
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {c.members} Members
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Materials */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-navy">Recent Materials</h3>
                <Link href="/publications" className="text-sm font-semibold text-primary">
                  View All Materials
                </Link>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase text-slate-400">
                      <th className="pb-3 font-semibold">Title</th>
                      <th className="pb-3 font-semibold">Class</th>
                      <th className="pb-3 font-semibold">Uploaded</th>
                      <th className="pb-3 font-semibold">Type</th>
                      <th className="pb-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {materials.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No materials yet.
                        </td>
                      </tr>
                    ) : (
                      materials.map((m) => (
                        <tr key={m.id} className="text-slate-600">
                          <td className="py-3 font-medium text-navy">
                            <Link
                              href={`/publications/${m.slug}`}
                              className="flex items-center gap-2 hover:text-primary"
                            >
                              <FileText className="h-4 w-4 text-primary" />
                              {m.title}
                            </Link>
                          </td>
                          <td className="py-3">{m.category?.title ?? "General"}</td>
                          <td className="py-3">{formatDate(m.publishedAt)}</td>
                          <td className="py-3">Research</td>
                          <td className="py-3 text-right">
                            <MoreVertical className="ml-auto h-4 w-4 text-slate-400" />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Upcoming */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-navy">Upcoming</h3>
                <Link href="/events" className="text-sm font-semibold text-primary">
                  View Calendar
                </Link>
              </div>
              <div className="mt-4 space-y-4">
                {upcoming.length === 0 ? (
                  <p className="text-sm text-slate-400">No upcoming events.</p>
                ) : (
                  upcoming.map((u) => (
                    <div key={u.id} className="flex items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-slate-50 text-navy">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          {u.eventDate.toLocaleDateString("en-US", { month: "short" })}
                        </span>
                        <span className="text-lg font-extrabold leading-none">
                          {u.eventDate.getDate()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-navy">
                          {u.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {u.eventDate.toLocaleDateString("en-US", {
                            weekday: "long",
                          })}
                          ,{" "}
                          {u.eventDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Announcements */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-navy">Announcements</h3>
                <span className="text-sm font-semibold text-primary">View All</span>
              </div>
              <div className="mt-4 space-y-4">
                {announcements.map((a) => (
                  <div key={a.title} className="flex gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${a.color}`}>
                      <a.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-navy">{a.title}</p>
                      <p className="text-xs text-slate-500">{a.body}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{a.ago}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Community Active */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="flex items-center gap-2 text-sm font-bold text-navy">
                <Users className="h-4 w-4" /> Community Active
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-3xl font-extrabold text-navy">128</span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Members
                  Online
                </span>
              </div>
              <div className="mt-4 flex items-center">
                {[...Array(6)].map((_, i) => (
                  <span
                    key={i}
                    className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-light text-xs font-bold text-primary first:ml-0"
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                ))}
                <span className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[11px] font-bold text-slate-500">
                  +45
                </span>
              </div>
              <Link
                href="/community"
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-blue-50 py-2.5 text-sm font-semibold text-primary"
              >
                <MessageSquare className="h-4 w-4" /> Go to Discussions
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
