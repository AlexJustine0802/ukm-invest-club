import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ResearchPageContent from "@/components/ResearchPageContent";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Investment research, publications, and market insights from Parahyangan Finance Club.",
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

/** How many publications the research hero cycles through. */
const HERO_SLIDES = 5;

export default async function PublicationsPage() {
  const [heroSlides, categories, latestPublications] = await Promise.all([
    // The hero is the newest published research, nothing to tick in the admin:
    // publish a sixth and the oldest slide drops off on its own.
    prisma.publication.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: HERO_SLIDES,
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
  ]);

  return (
    <ResearchPageContent
      heroSlides={heroSlides}
      categories={categories}
      latestPublications={latestPublications}
    />
  );
}
