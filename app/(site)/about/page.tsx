import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${site.fullName} — our mission, values, and committee.`,
};

const values = [
  {
    icon: "📚",
    title: "Financial literacy",
    text: "We make investing approachable through workshops, mentorship, and hands-on practice.",
  },
  {
    icon: "🤝",
    title: "Community",
    text: "A supportive network of students learning and growing as investors together.",
  },
  {
    icon: "📈",
    title: "Real experience",
    text: "From paper trading to research reports, we turn theory into practical skills.",
  },
];

export default async function AboutPage() {
  const team = await prisma.teamMember.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title={`About ${site.name}`}
        subtitle={site.tagline}
      />

      <section className="container-page py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-navy">Who we are</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            {site.fullName} ({site.name}) is a student-run investment club (UKM)
            dedicated to building financial literacy and a passion for investing
            among students. We host events, publish research, and create a
            community where members can learn, share ideas, and grow their
            skills — no prior experience required.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="card p-6 text-center">
              <div className="text-4xl">{v.icon}</div>
              <h3 className="mt-3 text-lg font-bold text-navy">{v.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-slate-50 py-16">
        <div className="container-page">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-navy">Meet the committee</h2>
            <p className="mt-2 text-slate-600">
              The people who keep {site.name} running.
            </p>
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
                      <div className="flex h-full items-center justify-center text-3xl text-slate-400">
                        👤
                      </div>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-navy">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-gold-dark">
                    {member.role}
                  </p>
                  {member.bio && (
                    <p className="mt-2 text-sm text-slate-600">{member.bio}</p>
                  )}
                  <div className="mt-3 flex justify-center gap-3 text-sm">
                    {member.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-gold-dark"
                      >
                        LinkedIn
                      </a>
                    )}
                    {member.instagram && (
                      <a
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-gold-dark"
                      >
                        Instagram
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
        </div>
      </section>
    </div>
  );
}
