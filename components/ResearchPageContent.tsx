"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, BookOpen, CalendarDays, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getResearchIcon } from "@/lib/researchIcons";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { TextAnimate } from "@/components/ui/text-animate";

export type PublicationSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  publishedAt: Date;
  pageCount: number | null;
  badge: string | null;
  category: { title: string; slug: string } | null;
};

export type ResearchCategoryWithPreview = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string;
  publications: PublicationSummary[];
};

interface ResearchPageContentProps {
  heroSlides: PublicationSummary[];
  categories: ResearchCategoryWithPreview[];
  latestPublications: PublicationSummary[];
}

const marketCards = [
  {
    title: "IHSG Movement",
    period: "YTD 2024",
    value: "7,123.45",
    change: "+8.45%",
    changeClass: "text-emerald-600",
    chart: "line",
  },
  {
    title: "Inflasi Indonesia",
    period: "Apr 2024",
    value: "2.83%",
    change: "-0.15%",
    changeClass: "text-emerald-600",
    chart: "bars",
  },
  {
    title: "BI Rate",
    period: "Mei 2024",
    value: "6.25%",
    change: "0.00%",
    changeClass: "text-slate-400",
    chart: "step",
  },
  {
    title: "USD/IDR",
    period: "Mei 2024",
    value: "16,245",
    change: "-0.35%",
    changeClass: "text-red-600",
    chart: "fx",
  },
];

function SectionHeader({
  title,
  action,
  href,
}: {
  title: string;
  action?: string;
  href?: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <TextAnimate
        as="h2"
        animation="blurInUp"
        by="character"
        once
        className="text-sm font-bold uppercase tracking-widest text-primary"
      >
        {title}
      </TextAnimate>
      {action && (
        <Link
          href={href ?? "/publications/all"}
          className="hidden items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-primary-dark sm:inline-flex"
        >
          {action}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function MarketChart({ type }: { type: string }) {
  if (type === "bars") {
    return (
      <div className="flex h-20 items-end gap-2">
        {[18, 40, 63, 34, 52, 27, 47, 21, 30, 68, 35, 78, 29].map(
          (height, index) => (
            <span
              key={`${height}-${index}`}
              className={`w-full rounded-t-sm ${
                index % 4 === 0 ? "bg-blue-200" : "bg-primary"
              }`}
              style={{ height: `${height}%` }}
            />
          ),
        )}
      </div>
    );
  }

  if (type === "step") {
    return (
      <svg viewBox="0 0 180 80" className="h-20 w-full" aria-hidden="true">
        <polyline
          points="4,24 36,24 36,46 66,46 66,58 98,58 98,45 126,45 126,32 158,32 158,18 176,18"
          fill="none"
          stroke="#7c3aed"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
      </svg>
    );
  }

  const points =
    type === "fx"
      ? "4,48 14,42 24,46 34,44 44,51 54,48 64,52 74,43 84,46 94,41 104,48 114,44 124,52 134,49 144,23 154,56 164,48 176,42"
      : "4,66 14,60 24,49 34,55 44,45 54,50 64,41 74,45 84,35 94,31 104,36 114,48 124,40 134,34 144,44 154,31 164,35 176,18";

  return (
    <svg viewBox="0 0 180 80" className="h-20 w-full" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={type === "fx" ? "#2563eb" : "#22c55e"}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
    </svg>
  );
}

function CategoryPanel({
  category,
}: {
  category: ResearchCategoryWithPreview;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-blue-50/70 p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase text-primary">
            Selected Category
          </p>
          <h3 className="mt-1 text-xl font-bold text-navy">{category.title}</h3>
        </div>
        <Link
          href={`/publications/all?category=${category.slug}`}
          className="btn-secondary bg-white"
        >
          View More
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {category.publications.length > 0 ? (
          category.publications.map((pub) => (
            <Link
              key={pub.id}
              href={`/publications/${pub.slug}`}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white transition-colors hover:border-primary"
            >
              {/* Cover set per publication in the admin; falls back so cards
                  in a row keep the same height. */}
              <div className="relative aspect-[16/9] bg-primary-light">
                <Image
                  src={pub.coverImage || "/images/research-building.png"}
                  alt={pub.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 320px"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <span className="text-xs font-bold uppercase text-primary">
                  {formatDate(pub.publishedAt)}
                </span>
                <h4 className="mt-2 text-base font-bold text-navy">
                  {pub.title}
                </h4>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                  {pub.excerpt}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-sm text-slate-500 md:col-span-3">
            No research published in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ResearchPageContent({
  heroSlides,
  categories,
  latestPublications,
}: ResearchPageContentProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const heroCards = heroSlides.map((s) => ({
    key: s.id,
    image: s.coverImage || "/images/research-building.png",
    badge: s.badge || s.category?.title || "Research",
    title: s.title,
    excerpt: s.excerpt,
    dateLabel: formatDate(s.publishedAt),
    pageCount: s.pageCount,
    href: `/publications/${s.slug}`,
  }));

  useEffect(() => {
    if (paused || heroCards.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroCards.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [paused, heroCards.length]);

  const slide = heroCards[activeSlide];
  const spotlight = latestPublications[0];
  const featuredList = latestPublications.slice(1, 4);

  return (
    <div className="bg-white text-navy">
      <Reveal
        as="section"
        className="relative overflow-hidden border-b border-blue-50 bg-white"
      >
        <div className="absolute right-0 top-0 h-64 w-72 bg-[radial-gradient(circle_at_center,#93b4ff_1.5px,transparent_1.5px)] opacity-70 [background-size:22px_22px]" />
        <div className="absolute -bottom-16 right-10 h-40 w-40 rounded-full bg-primary-light/70" />

        <div className="container-page relative grid min-h-[460px] items-center gap-10 py-14 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-2xl">
            <h1 className="site-hero-title mt-5">
              <TextAnimate
                as="span"
                animation="blurInUp"
                by="word"
                once
                className="block"
              >
                Insight Today,
              </TextAnimate>
              <span className="block">
                {/* <TextAnimate
                  as="span"
                  animation="blurInUp"
                  by="word"
                  once
                  className="inline-block"
                >
                  {"Better "}
                </TextAnimate> */}
                <TextAnimate
                  as="span"
                  animation="blurInUp"
                  by="word"
                  once
                  className="inline-block text-primary"
                >
                  Master Finance
                </TextAnimate>
                {" "}
                <TextAnimate
                  as="span"
                  animation="blurInUp"
                  by="word"
                  once
                  className="inline-block"
                >
                  {"&"}
                </TextAnimate>
                {" "}
                <TextAnimate
                  as="span"
                  animation="blurInUp"
                  by="word"
                  once
                  className="inline-block"
                >
                  {"Achieve Better"}
                </TextAnimate>
                {" "}
                <TextAnimate
                  as="span"
                  animation="blurInUp"
                  by="word"
                  once
                  className="inline-block"
                >
                  {"Returns Tomorrow"}
                </TextAnimate>
              </span>
            </h1>
            <TextAnimate
              as="p"
              animation="blurInUp"
              by="word"
              once
              className="site-hero-copy mt-6 max-w-xl"
            >
              Our collaborative research across Corporate, Personal, Public, and Market 
              sectors provides in-depth analysis and valuable insight to help you build 
              a solid financial foundation and make smarter investment decisions.
            </TextAnimate>
            <div className="site-hero-actions">
              <InteractiveHoverButton
                href="#featured-research"
                className="bg-primary text-white"
                fillClassName="bg-white"
                hoverTextClassName="text-primary"
              >
                <BookOpen className="mr-2 inline h-4 w-4" />
                Explore Research
              </InteractiveHoverButton>
              <InteractiveHoverButton href="/publications/all">
                <FileText className="mr-2 inline h-4 w-4" />
                View All Publications
              </InteractiveHoverButton>
            </div>
          </div>

          {!slide ? (
            // Same box the slider occupies, so the hero column never empties.
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg bg-navy shadow-xl">
                <div className="flex h-[300px] items-center justify-center sm:h-[350px]">
                  <p className="px-6 text-center text-sm text-white/60">
                    Featured research will appear here soon.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="relative"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div className="relative overflow-hidden rounded-lg bg-navy shadow-xl">
                <div className="relative h-[300px] sm:h-[350px]">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 560px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy-dark/72 to-navy-dark/15" />
                  <div className="absolute inset-0 flex flex-col justify-between p-7 sm:p-8">
                    <div>
                      <span className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-bold uppercase text-white">
                        {slide.badge}
                      </span>
                      <h2 className="mt-14 max-w-sm text-2xl font-bold text-white">
                        {slide.title}
                      </h2>
                      <p className="mt-5 line-clamp-2 max-w-md leading-7 text-blue-50">
                        {slide.excerpt}
                      </p>
                    </div>
                    {(slide.dateLabel || slide.pageCount) && (
                      <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-blue-50">
                        {slide.dateLabel && (
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            {slide.dateLabel}
                          </span>
                        )}
                        {slide.pageCount && (
                          <span className="inline-flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {slide.pageCount} Halaman
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {slide.href && (
                    <Link
                      href={slide.href}
                      aria-label={`Open ${slide.title}`}
                      className="absolute bottom-8 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-lg transition-transform hover:scale-105"
                    >
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  )}
                </div>
              </div>
              {heroCards.length > 1 && (
                <div className="mt-5 flex justify-center gap-2">
                  {heroCards.map((s, index) => (
                    <button
                      key={s.key}
                      type="button"
                      aria-label={`Go to slide ${index + 1}`}
                      onClick={() => setActiveSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        activeSlide === index
                          ? "w-5 bg-primary"
                          : "w-2 bg-slate-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Reveal>

      <Reveal as="section" className="container-page py-8">
        <SectionHeader title="Research Categories" />
        {categories.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-lg border border-slate-200 bg-white">
            <EmptyState message="Research categories will appear here soon" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map((category) => {
              const Icon = getResearchIcon(category.icon);
              const active = category.id === activeCategory?.id;
              return (
                <div key={category.id}>
                  <button
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`w-full rounded-lg border bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                      active
                        ? "border-primary ring-1 ring-primary"
                        : "border-slate-200"
                    }`}
                  >
                    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
                      <Icon className="h-9 w-9" />
                    </span>
                    <span className="mt-5 block text-sm font-bold text-navy">
                      {category.title}
                    </span>
                    {category.description && (
                      <span className="mt-3 block text-sm font-medium leading-6 text-slate-600">
                        {category.description}
                      </span>
                    )}
                  </button>

                  {/* Mobile: drop down right below the selected category */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out sm:hidden ${
                      active
                        ? "mt-4 max-h-[1600px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <CategoryPanel category={category} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Desktop / tablet: single panel below the whole grid */}
        {activeCategory && (
          <div className="mt-6 hidden sm:block">
            <CategoryPanel category={activeCategory} />
          </div>
        )}
      </Reveal>

      {spotlight && (
        <Reveal
          as="section"
          id="featured-research"
          className="container-page border-t border-slate-100 py-8"
        >
          <SectionHeader title="Featured Research" action="View All Research" />
          <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
            <Link
              href={`/publications/${spotlight.slug}`}
              className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md sm:grid-cols-[1.55fr_1fr]"
            >
              <div className="p-8">
                {spotlight.category && (
                  <span className="inline-flex rounded-md bg-blue-100 px-2.5 py-1 text-xs font-bold uppercase text-primary">
                    {spotlight.category.title}
                  </span>
                )}
                <h3 className="mt-8 text-2xl font-bold text-navy">
                  {spotlight.title}
                </h3>
                <p className="mt-5 line-clamp-2 max-w-sm leading-7 text-slate-600">
                  {spotlight.excerpt}
                </p>
                <div className="mt-16 flex flex-wrap items-center gap-8 text-sm font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-slate-500" />
                    {formatDate(spotlight.publishedAt)}
                  </span>
                  {spotlight.pageCount && (
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      {spotlight.pageCount} Halaman
                    </span>
                  )}
                </div>
              </div>
              <div className="relative min-h-[260px] bg-primary-light">
                <Image
                  src={spotlight.coverImage || "/images/research-building.png"}
                  alt={spotlight.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 330px"
                  className="object-cover"
                />
              </div>
            </Link>

            <div className="space-y-5">
              {featuredList.map((item) => (
                <Link
                  key={item.id}
                  href={`/publications/${item.slug}`}
                  className="group flex items-center gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
                    <BarChart3 className="h-7 w-7" />
                  </span>
                  <span className="min-w-0 flex-1">
                    {item.category && (
                      <span className="inline-flex rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold uppercase text-primary">
                        {item.category.title}
                      </span>
                    )}
                    <span className="mt-2 block text-lg font-bold text-navy">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm font-semibold text-slate-500">
                      {formatDate(item.publishedAt)}
                    </span>
                  </span>
                  <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* <Reveal
        as="section"
        className="container-page border-t border-slate-100 py-8">
        <SectionHeader title="Market Insights & Data" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {marketCards.map((card) => (
            <article
              key={card.title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-bold text-slate-500">{card.title}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {card.period}
              </p>
              <div className="mt-3 flex items-baseline gap-4">
                <p className="text-2xl font-bold text-navy">{card.value}</p>
                <p className={`text-sm font-bold ${card.changeClass}`}>
                  {card.change}
                </p>
              </div>
              <div className="mt-4">
                <MarketChart type={card.chart} />
              </div>
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs font-semibold text-slate-500">
          Source: IDX, Bank Indonesia, BPS
        </p>
      </Reveal> */}
    </div>
  );
}
