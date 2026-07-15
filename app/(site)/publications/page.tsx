import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ResearchPageContent from "@/components/ResearchPageContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Investment research, publications, and market insights from ICUnpar.",
};

const publicationSummarySelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImage: true,
  publishedAt: true,
  pageCount: true,
  badge: true,
  category: { select: { title: true, slug: true } },
} as const;

export default async function PublicationsPage() {
  const now = new Date();

  const [featured, categories, latestPublications, upcomingEvents, researchStats] =
    await Promise.all([
      prisma.publication.findMany({
        where: { published: true, featured: true },
        orderBy: [{ featuredOrder: "asc" }, { publishedAt: "desc" }],
        take: 6,
        select: publicationSummarySelect,
      }),
      prisma.researchCategory.findMany({
        orderBy: { order: "asc" },
        include: {
          publications: {
            where: { published: true },
            orderBy: { publishedAt: "desc" },
            take: 3,
            select: publicationSummarySelect,
          },
        },
      }),
      prisma.publication.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 4,
        select: publicationSummarySelect,
      }),
      prisma.event.findMany({
        where: { published: true, eventDate: { gte: now } },
        orderBy: { eventDate: "asc" },
        take: 3,
        select: {
          id: true,
          slug: true,
          title: true,
          eventDate: true,
          location: true,
          coverImage: true,
        },
      }),
      prisma.impactStat.findMany({
        where: { section: "research" },
        orderBy: { order: "asc" },
      }),
    ]);

  // Hero shows the ticked ("featured") publications; falls back to the latest.
  const heroSlides =
    featured.length > 0 ? featured : latestPublications.slice(0, 3);

  return (
    <ResearchPageContent
      heroSlides={heroSlides}
      categories={categories}
      latestPublications={latestPublications}
      upcomingEvents={upcomingEvents}
      researchStats={researchStats}
    />
  );
}
