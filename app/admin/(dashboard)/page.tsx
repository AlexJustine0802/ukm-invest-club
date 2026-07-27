import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminHome from "@/components/admin/AdminHome";
import { getAdminActor, allowedModules } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // A division member gets shortcuts to what their role can open. The counts
  // below are deliberately not computed for them: they read five tables the
  // member may have no permission to see.
  const actor = await getAdminActor();
  if (actor?.kind === "member") {
    return (
      <AdminHome
        name={actor.user.name}
        role={actor.user.role}
        modules={await allowedModules()}
      />
    );
  }

  const now = new Date();
  const [events, upcoming, publications, members, partners] = await Promise.all([
    prisma.event.count(),
    prisma.event.count({ where: { eventDate: { gte: now } } }),
    prisma.publication.count(),
    // The About page's people are member accounts, so that is the count worth
    // showing here.
    prisma.user.count(),
    prisma.partner.count(),
  ]);

  const cards = [
    { label: "Events", value: events, sub: `${upcoming} upcoming`, href: "/admin/events", icon: "📅" },
    { label: "Publications", value: publications, sub: "articles", href: "/admin/publications", icon: "📄" },
    { label: "Members", value: members, sub: "accounts", href: "/admin/members", icon: "👥" },
    { label: "Partners", value: partners, sub: "collaborations", href: "/admin/partners", icon: "🤝" },
  ];

  const quickActions = [
    // Events are created through their registration form  there is no
    // /admin/events/new route.
    { label: "New event", href: "/admin/registrations/new" },
    { label: "New publication", href: "/admin/publications/new" },
    { label: "Manage members", href: "/admin/members" },
    { label: "Edit home hero", href: "/admin/hero-slides?loc=home" },
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
