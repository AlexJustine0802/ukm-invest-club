import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import FeaturedSelectForm from "@/components/admin/FeaturedSelectForm";
import { setFeaturedPublications } from "./actions";

export const dynamic = "force-dynamic";

export default async function PublicationsHeroPage() {
  const publications = await prisma.publication.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, featured: true, publishedAt: true },
  });

  const items = publications.map((p) => ({
    id: p.id,
    label: p.title,
    sub: formatDate(p.publishedAt),
    checked: p.featured,
  }));

  return (
    <div>
      <Link
        href="/admin/publications"
        className="text-sm text-gold-dark hover:text-gold"
      >
        ← Back to publications
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Research Hero</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tick the research/publications to show in the Research page hero slider.
        If none are ticked, the latest publications are shown.
      </p>
      <div className="max-w-2xl">
        <FeaturedSelectForm
          action={setFeaturedPublications}
          items={items}
          emptyText="No published publications yet."
        />
      </div>
    </div>
  );
}
