import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, Shield, CalendarDays, BadgeCheck } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { prisma } from "@/lib/prisma";
import AccountTopBar from "@/components/account/AccountTopBar";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "My Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) redirect("/login");

  const details = [
    { label: "Email", value: user.email, icon: Mail },
    { label: "Position", value: user.role, icon: Shield },
    { label: "Member since", value: formatDate(user.createdAt), icon: CalendarDays },
    {
      label: "Email status",
      value: user.emailVerified ? "Verified" : "Not verified",
      icon: BadgeCheck,
    },
  ];

  return (
    <>
      <AccountTopBar
        title="My Profile"
        subtitle="Your account details and membership information."
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      <div className="mt-8 max-w-3xl space-y-6">
        {/* Header card */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-28 bg-gradient-to-br from-navy to-primary-dark" />
          <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
            <span className="-mt-12 flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-primary text-3xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1 sm:pb-1">
              <h2 className="text-xl font-bold text-navy">{user.name}</h2>
              <p className="text-sm text-slate-500">{user.role}</p>
            </div>
            <Link
              href="/account/settings"
              className="rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-semibold text-primary"
            >
              Edit in Settings
            </Link>
          </div>
        </section>

        {/* Details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-navy">Account Details</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {details.map((d) => (
              <div key={d.label} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                  <d.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <dt className="text-xs text-slate-400">{d.label}</dt>
                  <dd className="truncate text-sm font-semibold text-navy">
                    {d.value}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
