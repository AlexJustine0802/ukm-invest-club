import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, Mail, Shield, UserRound, ChevronRight } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import AccountTopBar from "@/components/account/AccountTopBar";
import { VerifyEmailButton } from "@/components/account/AccountSettingsForms";
import SettingsPreferencesForm from "@/components/account/SettingsPreferencesForm";
import DeleteAccountForm from "@/components/account/DeleteAccountForm";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

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
        showSearch={false}
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
                <UserRound className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">Name</p>
                <p className="truncate text-sm font-semibold text-navy">{user.name}</p>
              </div>
              <Link href="/account/profile" className="shrink-0 text-xs font-semibold text-primary hover:text-primary-dark">
                Edit profile
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                <Mail className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">Email</p>
                <p className="truncate text-sm font-semibold text-navy">{user.email}</p>
              </div>
              {user.emailVerified ? (
                <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                  Verified
                </span>
              ) : (
                <VerifyEmailButton />
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

        <SettingsPreferencesForm
          notifyAnnouncements={user.notifyAnnouncements}
          notifyEvents={user.notifyEvents}
          notifyAssignments={user.notifyAssignments}
          notifyCareer={user.notifyCareer}
          showPhoto={user.showPhoto}
          showSocials={user.showSocials}
        />

        {/* Data & account */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-navy">Data &amp; Account</h3>
          <p className="mt-1 text-sm text-slate-500">
            Permanently remove your membership and the data connected to it.
          </p>
          <div className="mt-5">
            <DeleteAccountForm />
          </div>
        </section>
      </div>
    </>
  );
}
