import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import { formatDate } from "@/lib/utils";
import { TextAnimate } from "@/components/ui/text-animate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Publications",
  description: "Browse all research publications from ICUnpar by category.",
};

const PAGE_SIZE = 9;

export default async function AllPublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string; q?: string }>;
}) {
  const { category, page: pageParam, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const query = q?.trim() ?? "";

  const categories = await prisma.researchCategory.findMany({
    orderBy: { order: "asc" },
    select: { title: true, slug: true },
  });

  const where = {
    published: true,
    ...(category ? { category: { slug: category } } : {}),
    ...(query
      ? {
          OR: [
            { title: { contains: query, mode: "insensitive" as const } },
            { excerpt: { contains: query, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [publications, total] = await Promise.all([
    prisma.publication.findMany({
      where,
      include: { category: { select: { title: true, slug: true } } },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.publication.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (params: { category?: string; page?: number }) => {
    const usp = new URLSearchParams();
    if (params.category) usp.set("category", params.category);
    if (query) usp.set("q", query);
    if (params.page && params.page > 1) usp.set("page", String(params.page));
    const qs = usp.toString();
    return qs ? `/publications/all?${qs}` : "/publications/all";
  };

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-primary-light/40 to-white">
        <div className="container-page py-14 lg:py-16">
          <Link
            href="/publications"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Research
          </Link>

          <div className="mx-auto mt-8 max-w-2xl text-center">
            <TextAnimate
              as="span"
              animation="blurInUp"
              by="character"
              once
              className="site-hero-eyebrow"
            >
              Research Library
            </TextAnimate>
            <TextAnimate
              as="h1"
              animation="blurInUp"
              by="character"
              once
              className="site-hero-title mt-3"
            >
              All Publications
            </TextAnimate>
            <TextAnimate
              as="p"
              animation="blurInUp"
              by="word"
              once
              className="site-hero-copy mt-4"
            >
              Browse every research publication from ICUnpar, across all
              categories.
            </TextAnimate>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container-page py-10">
        <SearchBar
          action="/publications/all"
          placeholder="Search publications..."
          defaultValue={query}
          hidden={{ category }}
        />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href={buildHref({})}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              !category
                ? "bg-primary text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={buildHref({ category: c.slug })}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                category === c.slug
                  ? "bg-primary text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"
              }`}
            >
              {c.title}
            </Link>
          ))}
        </div>

        {/* Grid */}
        {publications.length === 0 ? (
          <div className="mt-10 flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <EmptyState
              message={
                query
                  ? `No publications match “${query}”.`
                  : "No publications in this category yet."
              }
            />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publications.map((pub) => (
              <Link
                key={pub.id}
                href={`/publications/${pub.slug}`}
                className="card overflow-hidden transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-video bg-slate-100">
                  <Image
                    src={pub.coverImage || "/images/research-modeling.png"}
                    alt={pub.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                <div className="p-4">
                  {pub.category && (
                    <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {pub.category.title}
                    </span>
                  )}
                  <h3 className="mt-1 font-bold text-navy">{pub.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {pub.excerpt}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {formatDate(pub.publishedAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-1">
            <Link
              href={buildHref({ category, page: Math.max(1, page - 1) })}
              aria-disabled={page === 1}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 ${
                page === 1
                  ? "pointer-events-none opacity-40"
                  : "hover:border-primary hover:text-primary"
              }`}
            >
              ‹
            </Link>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildHref({ category, page: p })}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${
                  p === page
                    ? "bg-primary text-white"
                    : "border border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                }`}
              >
                {p}
              </Link>
            ))}
            <Link
              href={buildHref({
                category,
                page: Math.min(totalPages, page + 1),
              })}
              aria-disabled={page === totalPages}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 ${
                page === totalPages
                  ? "pointer-events-none opacity-40"
                  : "hover:border-primary hover:text-primary"
              }`}
            >
              ›
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
