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
import { formatDate } from "@/lib/utils";
import PartnerStrip from "@/components/PartnerStrip";

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
  { year: "2020", icon: Flag, title: "Founded", text: "Started by a group of students with a vision to build a campus investing culture." },
  { year: "2021", icon: Users, title: "Growing Together", text: "Held educational activities and regular discussions with practitioners and experts." },
  { year: "2022", icon: FileText, title: "Research Expansion", text: "Began publishing periodic research and building a market-analysis database." },
  { year: "2023", icon: Handshake, title: "Stronger Collaboration", text: "Partnered with institutions, companies, and other investment communities." },
  { year: "2024+", icon: Trophy, title: "Impact the Future", text: "Continuing to grow and deliver greater impact for members and society." },
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
    <div className={`relative overflow-hidden rounded-2xl ${imageHeight} ${className}`}>
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

const divisions = [
  { icon: ChartColumn, title: "Investment Analyst", text: "Analyze markets, sectors, and companies and publish quality research." },
  { icon: Camera, title: "Media & Creative", text: "Manage content, design, and communication to spread educational information." },
  { icon: Users, title: "Human Resource", text: "Manage member development, recruitment, and internal community activities." },
  { icon: Handshake, title: "Partnership", text: "Build and maintain good relationships with partners, sponsors, and institutions." },
  { icon: CalendarDays, title: "Event & Program", text: "Design and run activities that benefit members." },
];

export default async function AboutPage() {
  const [team, stats, partners, communityMoments, settings] = await Promise.all([
    prisma.teamMember.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
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
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-primary-light/40 to-white">
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
            {stats.map((s) => {
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
                      {s.value}
                    </p>
                    <p className="text-xs text-slate-500">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who we are / Vision / Mission */}
      <section className="container-page py-16">
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
      </section>

      {/* Our Journey */}
      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Our Journey
            </span>
            <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-bold text-navy">
              Every Step, Building a Stronger Future
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              From a small initiative on campus to a growing investment
              community that creates impact for members and society.
            </p>
          </div>

          <div className="relative mt-14">
            <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-primary-light sm:block" />

            <div className="space-y-10 sm:space-y-6">
              {journey.map((j, i) => {
                const onRight = i % 2 === 1;
                const card = (
                  <div className="card p-6">
                    <span className="text-sm font-bold text-primary">
                      {j.year}
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-navy">
                      {j.title}
                    </h3>
                    <span className="mt-2 block h-0.5 w-8 bg-primary-light" />
                    <p className="mt-3 text-sm text-slate-600">{j.text}</p>
                  </div>
                );
                const badge = (
                  <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-primary-light bg-white text-primary">
                    <j.icon className="h-6 w-6" />
                  </span>
                );

                return (
                  <div
                    key={j.year}
                    className="grid grid-cols-[auto_1fr] items-center gap-4 sm:grid-cols-[1fr_auto_1fr] sm:gap-6"
                  >
                    <div className="sm:hidden">{badge}</div>
                    <div className="sm:hidden">{card}</div>

                    <div className="hidden sm:block">
                      {!onRight && (
                        <div className="flex items-center justify-end gap-4">
                          <div className="flex-1">{card}</div>
                          <span className="h-0.5 w-6 bg-primary-light" />
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                    <div className="hidden sm:block">{badge}</div>
                    <div className="hidden sm:block">
                      {onRight && (
                        <div className="flex items-center gap-4">
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span className="h-0.5 w-6 bg-primary-light" />
                          <div className="flex-1">{card}</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Our Community */}
      <section id="community" className="container-page py-16">
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

        {moments.length > 0 && (
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
              <div className="grid grid-cols-2 gap-4">
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
      </section>

      {/* Our Divisions */}
      <section className="container-page py-16">
        <span className="text-sm font-semibold uppercase tracking-widest text-primary">
          Our Divisions
        </span>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {divisions.map((d) => (
            <div key={d.title} className="card p-6 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
                <d.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold text-navy">{d.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{d.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                Meet Our Team
              </span>
              <h2 className="mt-2 text-3xl font-bold text-navy">
                The people who keep {site.name} running
              </h2>
            </div>
          </div>

          {team.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <div key={member.id} className="card p-6 text-center">
                  <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full bg-slate-200">
                    {member.photo ? (
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="112px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        <Users className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-navy">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-primary">
                    {member.role}
                  </p>
                  {member.bio && (
                    <p className="mt-2 text-sm text-slate-600">{member.bio}</p>
                  )}
                  <div className="mt-3 flex justify-center gap-3">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on LinkedIn`}
                        className="text-slate-400 hover:text-primary"
                      >
                        <Link2 className="h-4 w-4" />
                      </a>
                    )}
                    {member.instagram && (
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${member.name} on Instagram`}
                        className="text-slate-400 hover:text-primary"
                      >
                        <AtSign className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-center text-slate-500">
              Committee members coming soon.
            </p>
          )}

          <div className="mt-10 text-center">
            <Link href="/contact" className="btn-primary">
              <TrendingUp className="mr-2 h-4 w-4" />
              Join Our Team
            </Link>
          </div>
        </div>
      </section>

      <PartnerStrip partners={partners} />
    </div>
  );
}
