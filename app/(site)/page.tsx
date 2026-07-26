import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";
import { getUiIcon } from "@/lib/uiIcons";
import { withDefaultStats } from "@/lib/impactStats";
import EmptyState from "@/components/EmptyState";
import EventCard from "@/components/EventCard";
import HeroCarousel from "@/components/HeroCarousel";
import AboutSlideshow from "@/components/AboutSlideshow";
import PublicationCard from "@/components/PublicationCard";
import PartnerStrip from "@/components/PartnerStrip";
import Reveal from "@/components/Reveal";
import StaggerGrid from "@/components/StaggerGrid";
import CountUp from "@/components/CountUp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const now = new Date();

  const [
    upcomingEvents,
    latestPublications,
    heroSlides,
    impact,
    partners,
    settings,
    aboutSlides,
  ] = await Promise.all([
    prisma.event.findMany({
      where: { published: true, eventDate: { gte: now } },
      orderBy: { eventDate: "asc" },
      take: 3,
    }),
    prisma.publication.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
    prisma.heroSlide.findMany({
      where: { location: "home" },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.impactStat.findMany({
      where: { section: "home" },
      orderBy: { order: "asc" },
    }),
    prisma.partner.findMany({ orderBy: { order: "asc" } }),
    prisma.siteSettings.findUnique({ where: { id: 1 } }),
    prisma.heroSlide.findMany({
      where: { location: "home-about" },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  // Fall back to most recent past events if nothing upcoming.
  const featuredEvents =
    upcomingEvents.length > 0
      ? upcomingEvents
      : await prisma.event.findMany({
          where: { published: true },
          orderBy: { eventDate: "desc" },
          take: 3,
        });

  const slides = heroSlides.map((s) => ({
    eyebrow: s.eyebrow,
    titleStart: s.titleStart,
    highlight: s.highlight,
    titleEnd: s.titleEnd,
    description: s.description,
    image: s.imageUrl,
  }));

  // About-Us slideshow images; fall back to the legacy single settings image.
  const aboutImages = aboutSlides.map((s) => s.imageUrl);
  if (aboutImages.length === 0 && settings?.homeAboutImage) {
    aboutImages.push(settings.homeAboutImage);
  }

  return (
    <>
      <HeroCarousel slides={slides} />

      {/* Impact */}
      <Reveal as="section" className="bg-slate-50 py-16">
        <div className="container-page">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Our Impact
          </span>
          <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {withDefaultStats(impact, "home").map((stat) => {
              const Icon = getUiIcon(stat.icon);
              return (
                <div key={stat.id} className="card flex items-center gap-4 p-6">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-2xl font-extrabold text-navy sm:text-3xl">
                      <CountUp value={stat.value} />
                    </p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* About strip */}
      <Reveal as="section" className="container-page py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              About Us
            </span>
            <h2 className="mt-3 text-3xl font-bold text-navy">
              Building Knowledge, Creating Impact
            </h2>
            <p className="mt-4 text-slate-600">
              {site.fullName} ({site.name}) is a student-run investment club
              focused on financial literacy, market analysis, and self-growth —
              creating smart, competitive investors.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center text-sm font-semibold text-primary hover:text-primary-dark"
            >
              Learn More About Us
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
          <AboutSlideshow images={aboutImages} />
        </div>
      </Reveal>

      {/* Latest Research */}
      <Reveal as="section" className="bg-slate-50 py-16">
        <div className="container-page">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold text-navy">Latest Research</h2>
              <p className="mt-2 text-slate-600">
                Research, insights, and learning resources from our members.
              </p>
            </div>
            <Link
              href="/publications"
              className="hidden text-sm font-semibold text-primary hover:text-primary-dark sm:block"
            >
              View All Research →
            </Link>
          </div>
          {latestPublications.length > 0 ? (
            <StaggerGrid className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {latestPublications.map((pub) => (
                <PublicationCard key={pub.id} publication={pub} />
              ))}
            </StaggerGrid>
          ) : (
            // Holds roughly one card row so the section keeps its height.
            <div className="mt-8 flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <EmptyState message="No publications yet" />
            </div>
          )}
        </div>
      </Reveal>

      {/* Upcoming Events */}
      <Reveal as="section" className="container-page py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-navy">
              {upcomingEvents.length > 0 ? "Upcoming Events" : "Recent Events"}
            </h2>
            <p className="mt-2 text-slate-600">
              Join our activities and grow your investing skills.
            </p>
          </div>
          <Link
            href="/events"
            className="hidden text-sm font-semibold text-primary hover:text-primary-dark sm:block"
          >
            View All Events →
          </Link>
        </div>
        {featuredEvents.length > 0 ? (
          <StaggerGrid className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </StaggerGrid>
        ) : (
          <div className="mt-8 flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <EmptyState message="No events yet. Check back soon!" />
          </div>
        )}
      </Reveal>

      {/* Contact CTA */}
      <Reveal as="section" className="container-page py-16">
        <div className="relative overflow-hidden rounded-2xl bg-navy p-8 text-white shadow-lg sm:p-12">
          <div className="absolute right-0 top-0 h-full w-44 bg-[radial-gradient(circle_at_center,#93b4ff_1.4px,transparent_1.4px)] opacity-60 [background-size:20px_20px]" />
          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary-light/20 text-white">
                <Mail className="h-7 w-7" />
              </span>
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  Have a question? Get in touch.
                </h2>
                <p className="mt-2 max-w-xl text-blue-100">
                  Reach out to {site.name} for collaborations, membership, or
                  anything about our activities.
                </p>
              </div>
            </div>
            <Link href="/contact" className="btn-primary shrink-0">
              Contact Us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Renders its own two sections, each with its own reveal. */}
      <PartnerStrip partners={partners} />
    </>
  );
}
