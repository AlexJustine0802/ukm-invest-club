import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PublicationCard from "@/components/PublicationCard";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Publications",
  description: "Investment research, insights, and articles from ICUnpar.",
};

export default async function PublicationsPage() {
  const publications = await prisma.publication.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Publications"
        subtitle="Research, insights, and learning resources written by our members."
      />
      <div className="container-page py-12">
        {publications.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publications.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No publications yet — check back soon!</p>
        )}
      </div>
    </div>
  );
}
