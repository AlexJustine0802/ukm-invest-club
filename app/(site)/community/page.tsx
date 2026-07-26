import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import EmptyState from "@/components/EmptyState";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community Moments",
  description: `A collection of ${site.name}'s precious moments in every event.`,
};

const PAGE_SIZE = 9;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const categoryGroups = await prisma.moment.findMany({
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  const categories = categoryGroups.map((c) => c.category);

  const where = category ? { category } : {};
  const [moments, total, collage] = await Promise.all([
    prisma.moment.findMany({
      where,
      include: { photos: { orderBy: { order: "asc" }, take: 3 } },
      orderBy: [{ date: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.moment.count({ where }),
    prisma.moment.findMany({
      select: { coverImage: true },
      orderBy: { date: "desc" },
      take: 6,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const buildHref = (params: { category?: string; page?: number }) => {
    const usp = new URLSearchParams();
    if (params.category) usp.set("category", params.category);
    if (params.page && params.page > 1) usp.set("page", String(params.page));
    const qs = usp.toString();
    return qs ? `/community?${qs}` : "/community";
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-primary-light/40 to-white">
        <div className="pointer-events-none absolute inset-0 grid grid-cols-6 gap-2 opacity-15">
          {collage.map((m, i) => (
            <div
              key={i}
              className={`relative ${i % 2 === 0 ? "mt-8" : ""} aspect-square overflow-hidden rounded-xl`}
            >
              <Image
                src={m.coverImage}
                alt=""
                fill
                className="object-cover"
                sizes="16vw"
              />
            </div>
          ))}
        </div>

        <div className="container-page relative py-14 lg:py-16">
          <Link
            href="/about#community"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Our Community
          </Link>

          <div className="mx-auto mt-8 max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Our Community
            </span>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-navy sm:text-5xl">
              Community Moments
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              A collection of our precious moments in every event. Together,
              we learn, grow, and make an impact.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="container-page py-10">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/community"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              !category
                ? "bg-primary text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"
            }`}
          >
            All Moments
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={buildHref({ category: c })}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                category === c
                  ? "bg-primary text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {/* Grid */}
        {moments.length === 0 ? (
          <div className="mt-10 flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <EmptyState message="No moments in this category yet." />
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {moments.map((m) => (
              <div key={m.id} className="card overflow-hidden">
                <div className="relative aspect-video bg-slate-100">
                  <Image
                    src={m.coverImage}
                    alt={m.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </div>
                {m.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-0.5 bg-slate-100">
                    {m.photos.map((p) => (
                      <div key={p.id} className="relative aspect-video">
                        <Image
                          src={p.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="15vw"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {m.category}
                  </span>
                  <h3 className="mt-1 font-bold text-navy">{m.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {dateFormatter.format(m.date)}
                  </p>
                </div>
              </div>
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
