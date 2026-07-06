import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const [events, upcoming, publications, team, gallery] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { eventDate: { gte: now } } }),
    prisma.publication.count(),
    prisma.teamMember.count(),
    prisma.galleryImage.count(),
  ]);

  const cards = [
    { label: "Events", value: events, sub: `${upcoming} upcoming`, href: "/admin/events", icon: "📅" },
    { label: "Publications", value: publications, sub: "articles", href: "/admin/publications", icon: "📄" },
    { label: "Team members", value: team, sub: "committee", href: "/admin/team", icon: "👥" },
    { label: "Gallery photos", value: gallery, sub: "images", href: "/admin/gallery", icon: "🖼️" },
  ];

  const quickActions = [
    { label: "New event", href: "/admin/events/new" },
    { label: "New publication", href: "/admin/publications/new" },
    { label: "Add team member", href: "/admin/team/new" },
    { label: "Add gallery photo", href: "/admin/gallery/new" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
      <p className="mt-1 text-slate-500">
        Manage your website content from here.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="card p-5 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-3xl font-extrabold text-navy">
                {card.value}
              </span>
            </div>
            <p className="mt-2 font-semibold text-navy">{card.label}</p>
            <p className="text-sm text-slate-400">{card.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-navy">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {quickActions.map((a) => (
            <Link key={a.href} href={a.href} className="btn-navy">
              + {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
