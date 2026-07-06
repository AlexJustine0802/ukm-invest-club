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
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import PartnerStrip from "@/components/PartnerStrip";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${site.fullName} — our mission, values, and committee.`,
};

const stats = [
  { icon: Users, value: "350+", label: "Active Members" },
  { icon: FileText, value: "120+", label: "Research Published" },
  { icon: CalendarDays, value: "40+", label: "Events Held" },
];

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

const divisions = [
  { icon: ChartColumn, title: "Investment Analyst", text: "Analyze markets, sectors, and companies and publish quality research." },
  { icon: Camera, title: "Media & Creative", text: "Manage content, design, and communication to spread educational information." },
  { icon: Users, title: "Human Resource", text: "Manage member development, recruitment, and internal community activities." },
  { icon: Handshake, title: "Partnership", text: "Build and maintain good relationships with partners, sponsors, and institutions." },
  { icon: CalendarDays, title: "Event & Program", text: "Design and run activities that benefit members." },
];

export default async function AboutPage() {
  const team = await prisma.teamMember.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-primary-light/40 to-white">
        <div className="container-page py-16 text-center lg:py-20">
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

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="card flex items-center justify-center gap-3 p-5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <p className="text-2xl font-extrabold text-navy">{s.value}</p>
                  <p className="text-xs text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
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
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Our Journey
          </span>
          <ol className="mt-8 space-y-6 border-l-2 border-primary-light pl-8">
            {journey.map((j) => (
              <li key={j.year} className="relative">
                <span className="absolute -left-[41px] flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary-light bg-white text-primary">
                  <j.icon className="h-4 w-4" />
                </span>
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-sm font-bold text-primary">{j.year}</span>
                  <h3 className="text-base font-bold text-navy">{j.title}</h3>
                </div>
                <p className="mt-1 text-sm text-slate-600">{j.text}</p>
              </li>
            ))}
          </ol>
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

      <PartnerStrip />
    </div>
  );
}
