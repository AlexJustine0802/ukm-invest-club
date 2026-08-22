import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, AtSign, MessageSquare, ChevronDown } from "lucide-react";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import AccountTopBar from "@/components/account/AccountTopBar";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Help & Support" };
export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "How do I access learning materials?",
    a: "Open Resources from the sidebar. Materials are grouped into folders by topic  use the category filters or the search bar to find something specific.",
  },
  {
    q: "How do I register for an event?",
    a: "Upcoming events appear on your Dashboard and in the Events page. Click Register on the event you want to join and you will receive a confirmation email.",
  },
  {
    q: "I did not receive my verification email.",
    a: "Try logging in again  we send a fresh verification link automatically each time an unverified account attempts to log in. Also check your spam folder.",
  },
  {
    q: "How do I reset my password?",
    a: "Go to Settings → Change password, or use the Forgot password link on the login page. We email you a secure link that expires in one hour.",
  },
  {
    q: "How is my position (Member, Committee) decided?",
    a: "Positions are assigned by PFC administrators. If your position looks wrong, contact us and we will correct it.",
  },
];

export default async function HelpPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const channels = [
    { label: "Email us", value: site.email, href: `mailto:${site.email}`, icon: Mail },
    { label: "Instagram", value: "@icunpar", href: site.instagram, icon: AtSign },
    { label: "Contact form", value: "Send us a message", href: "/contact", icon: MessageSquare },
  ];

  return (
    <>
      <AccountTopBar
        title="Help & Support"
        subtitle="Answers to common questions, and how to reach us."
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      <div className="mt-8 max-w-3xl space-y-6">
        {/* Contact channels */}
        <section className="grid gap-4 sm:grid-cols-3">
          {channels.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="rounded-2xl border border-slate-200 bg-white p-5 hover:bg-slate-50"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-sm font-bold text-navy">{c.label}</p>
              <p className="truncate text-xs text-slate-500">{c.value}</p>
            </Link>
          ))}
        </section>

        {/* FAQ */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="font-bold text-navy">Frequently Asked Questions</h3>
          <div className="mt-4 divide-y divide-slate-100">
            {faqs.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-navy">
                  {f.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-slate-500">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
