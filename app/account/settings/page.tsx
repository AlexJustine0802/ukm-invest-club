import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, Mail, Shield, ChevronRight } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import AccountTopBar from "@/components/account/AccountTopBar";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

const notificationPrefs = [
  { label: "Email announcements", desc: "New club announcements and updates.", on: true },
  { label: "Event reminders", desc: "Reminders before events you registered for.", on: true },
  { label: "Assignment deadlines", desc: "Alerts when a deadline is approaching.", on: true },
  { label: "Career alerts", desc: "New internship and job opportunities.", on: false },
];

export default async function SettingsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  return (
    <>
      <AccountTopBar
        title="Settings"
        subtitle="Manage your account, security, and notification preferences."
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      <div className="mt-8 max-w-3xl space-y-6">
        {/* Account */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-navy">Account</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                <Mail className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">Email</p>
                <p className="truncate text-sm font-semibold text-navy">{user.email}</p>
              </div>
              {user.emailVerified && (
                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                <Shield className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">Position</p>
                <p className="text-sm font-semibold text-navy">{user.role}</p>
              </div>
              <span className="shrink-0 text-xs text-slate-400">Set by admin</span>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-navy">Security</h3>
          <Link
            href="/forgot-password"
            className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
              <KeyRound className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-navy">Change password</p>
              <p className="text-xs text-slate-500">
                We will email you a secure reset link.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
          </Link>
        </section>

        {/* Notifications */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-navy">Notifications</h3>
          <div className="mt-4 space-y-4">
            {notificationPrefs.map((p) => (
              <div key={p.label} className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy">{p.label}</p>
                  <p className="text-xs text-slate-500">{p.desc}</p>
                </div>
                <span
                  className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 ${
                    p.on ? "justify-end bg-primary" : "justify-start bg-slate-200"
                  }`}
                >
                  <span className="h-5 w-5 rounded-full bg-white" />
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Preference saving is not wired up yet — these show your defaults.
          </p>
        </section>
      </div>
    </>
  );
}
