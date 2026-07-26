import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  FileText,
  CalendarDays,
  Eye,
  Target,
  Check,
  Flag,
  TrendingUp,
  ChartColumn,
  Camera,
  Handshake,
  Trophy,
  Link2,
  AtSign,
  Landmark,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import { getUiIcon } from "@/lib/uiIcons";
import { withDefaultStats } from "@/lib/impactStats";
import { formatDate } from "@/lib/utils";
import PartnerStrip from "@/components/PartnerStrip";
import DivisionsSection from "@/components/DivisionsSection";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";
import {
  DIVISIONS,
  divisionTagline,
  sortDivisionPeople,
  isHead,
} from "@/lib/roles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${site.fullName} — our mission, values, and committee.`,
};

const missions = [
  "Improve investment literacy and understanding among students.",
  "Produce quality research that is informative and objective.",
  "Run activities that benefit members and the wider community.",
  "Build strategic collaborations with various partners.",
];

const journey = [
  {
    year: "2020",
    icon: Flag,
    title: "Founded",
    text: "Started by a group of students with a vision to build a campus investing culture.",
  },
  {
    year: "2021",
    icon: Users,
    title: "Growing Together",
    text: "Held educational activities and regular discussions with practitioners and experts.",
  },
  {
    year: "2022",
    icon: FileText,
    title: "Research Expansion",
    text: "Began publishing periodic research and building a market-analysis database.",
  },
  {
    year: "2023",
    icon: Handshake,
    title: "Stronger Collaboration",
    text: "Partnered with institutions, companies, and other investment communities.",
  },
  {
    year: "2024+",
    icon: Trophy,
    title: "Impact the Future",
    text: "Continuing to grow and deliver greater impact for members and society.",
  },
];

type MomentView = {
  image: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  date: string;
};

function MomentCard({
  moment,
  className = "",
  imageHeight = "h-56",
}: {
  moment: MomentView;
  className?: string;
  imageHeight?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${imageHeight} ${className}`}
    >
      <Image
        src={moment.image}
        alt={moment.title}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
          <moment.icon className="h-5 w-5" />
        </span>
        <div className="text-white">
          <p className="font-bold">{moment.title}</p>
          <p className="text-sm text-white/85">{moment.subtitle}</p>
          <p className="text-xs text-white/70">{moment.date}</p>
        </div>
      </div>
    </div>
  );
}

export default async function AboutPage() {
  const [divisionPeople, stats, partners, communityMoments, settings] =
    await Promise.all([
      // The people are member accounts — edited once in /admin/members and shown
      // here and in the member area both.
      prisma.user.findMany({
        where: { division: { not: null } },
        select: {
          id: true,
          name: true,
          role: true,
          division: true,
          photo: true,
          bio: true,
          instagram: true,
          linkedin: true,
        },
      }),
      prisma.impactStat.findMany({
        where: { section: "home" },
        orderBy: { order: "asc" },
      }),
      prisma.partner.findMany({ orderBy: { order: "asc" } }),
      prisma.moment.findMany({
        orderBy: [{ order: "asc" }, { date: "desc" }],
        take: 4,
      }),
      prisma.siteSettings.findUnique({ where: { id: 1 } }),
    ]);

  // The org chart itself is fixed in lib/roles; only the people in it come from
  // the database, so this section renders in full even with no members yet.
  const divisions = DIVISIONS.map((d) => ({
    id: d.slug,
    slug: d.slug,
    name: d.name,
    tagline: divisionTagline(d),
    description: d.description,
    icon: d.icon,
    members: sortDivisionPeople(
      divisionPeople.filter((p) => p.division === d.slug),
      d.slug,
    ).map((p) => ({
      id: p.id,
      name: p.name,
      role: p.role,
      isHead: isHead(p.role),
      photo: p.photo,
      bio: p.bio,
      instagram: p.instagram,
      linkedin: p.linkedin,
    })),
  }));

  const moments: MomentView[] = communityMoments.map((m) => ({
    image: m.coverImage,
    icon: getUiIcon("Users"),
    title: m.title,
    subtitle: m.category,
    date: formatDate(m.date),
  }));

  return (
    <div>
      {/* Hero */}
      <Reveal
        as="section"
        className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-primary-light/40 to-white"
      >
        {settings?.aboutHeroImage && (
          <>
            <Image
              src={settings.aboutHeroImage}
              alt=""
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-white/80" />
          </>
        )}
        <div className="container-page relative py-16 text-center lg:py-20">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            About Us
          </span>
          <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
            About <span className="text-primary">{site.name}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            We are a campus community that shares knowledge, analyzes markets,
            and grows together in the world of investment.
          </p>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {withDefaultStats(stats, "home").map((s) => {
              const Icon = getUiIcon(s.icon);
              return (
                <div
                  key={s.id}
                  className="card flex items-center justify-center gap-3 p-5"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="text-left">
                    <p className="text-2xl font-extrabold text-navy">
                      <CountUp value={s.value} />
                    </p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Who we are / Vision / Mission */}
      <Reveal as="section" className="container-page py-16">
        <div className="grid gap-8 lg:grid-cols-3">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Who We Are
            </span>
            <h2 className="mt-3 text-3xl font-bold text-navy">
              Building Knowledge, Creating Impact
            </h2>
            <p className="mt-4 text-slate-600">
              {site.fullName} ({site.name}) is a student-run investment club
              (UKM) dedicated to building financial literacy and a passion for
              investing among students.
            </p>
            <p className="mt-4 text-slate-600">
              We believe collaboration, consistency, and curiosity are the keys
              to growing together and making a positive impact.
            </p>
          </div>

          <div className="card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
              <Eye className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-navy">Our Vision</h3>
            <p className="mt-3 text-sm text-slate-600">
              To be a leading student investment community that creates a
              generation of smart, ethical investors who contribute to society.
            </p>
          </div>

          <div className="card p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
              <Target className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-navy">Our Mission</h3>
            <ul className="mt-3 space-y-2">
              {missions.map((m) => (
                <li key={m} className="flex gap-2 text-sm text-slate-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Reveal>

      {/* Our Community */}
      <Reveal as="section" id="community" className="container-page py-16">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Our Community
          </span>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold text-navy">
            More Than Investing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            We build friendships, share knowledge, and create opportunities to
            grow together as a community.
          </p>
        </div>

        {moments.length === 0 ? (
          // Keeps the section's height so the page does not jump when there
          // are no moments yet.
          <div className="mt-12 flex min-h-[420px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <EmptyState message="Community moments will appear here soon" />
          </div>
        ) : (
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {moments[0] && (
              <MomentCard
                moment={moments[0]}
                imageHeight="h-72 lg:h-full"
                className="lg:row-span-2"
              />
            )}
            {moments[1] && (
              <MomentCard moment={moments[1]} imageHeight="h-56" />
            )}
            {(moments[2] || moments[3]) && (
              <div className="grid gap-4 sm:grid-cols-2">
                {moments[2] && (
                  <MomentCard moment={moments[2]} imageHeight="h-56" />
                )}
                {moments[3] && (
                  <MomentCard moment={moments[3]} imageHeight="h-56" />
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link href="/community" className="btn-primary">
            View All Moments
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </Reveal>

      <Reveal>
        <DivisionsSection divisions={divisions} />
      </Reveal>

      <Reveal>
        <PartnerStrip partners={partners} />
      </Reveal>
    </div>
  );
}
