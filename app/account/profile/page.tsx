import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, Shield, CalendarDays, BadgeCheck } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import AccountTopBar from "@/components/account/AccountTopBar";
import { formatDate } from "@/lib/utils";
import SocialLinksForm from "@/components/account/SocialLinksForm";
import ProfilePhotoForm from "@/components/account/ProfilePhotoForm";

export const metadata: Metadata = { title: "My Profile" };
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
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
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      <div className="mt-8 max-w-3xl space-y-6">
        {/* Header card */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-28 bg-gradient-to-br from-navy to-primary-dark" />
          <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
            <span className="-mt-12 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-primary text-3xl font-bold text-white">
              {user.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photo}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
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

        {/* Photo */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-navy">Profile photo</h3>
          <ProfilePhotoForm
            photo={user.photo}
            initial={user.name.charAt(0).toUpperCase()}
          />
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

        {/* Socials — the member's own, shown on their card in Members. */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-navy">Social links</h3>
          <p className="mt-1 text-sm text-slate-500">
            Optional. Other members see these on your card, and they appear on
            the public About page if you are listed in a division.
          </p>
          <SocialLinksForm
            instagram={user.instagram}
            linkedin={user.linkedin}
          />
        </section>
      </div>
    </>
  );
}
