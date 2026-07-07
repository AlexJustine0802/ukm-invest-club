"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  CalendarDays,
  CircleDollarSign,
  Clock,
  Download,
  FileSpreadsheet,
  FileText,
  Globe2,
  Landmark,
  MapPin,
  PieChart,
  Presentation,
  TrendingUp,
  Users,
  Waypoints,
} from "lucide-react";

type ResearchMenuItem = {
  title: string;
  description: string;
  meta: string;
};

type ResearchCategory = {
  title: string;
  description: string;
  icon: LucideIcon;
  menu: ResearchMenuItem[];
};

const researchCategories: ResearchCategory[] = [
  {
    title: "Equity Research",
    description: "Analisis saham & sektor",
    icon: PieChart,
    menu: [
      {
        title: "Banking Sector Outlook",
        description: "Coverage bank besar, NIM, kredit, dan risiko kualitas aset.",
        meta: "Latest report",
      },
      {
        title: "Consumer Staples Watchlist",
        description: "Update valuasi dan katalis sektor konsumer defensif.",
        meta: "Sector notes",
      },
      {
        title: "Stock Pitch Library",
        description: "Kumpulan template dan ringkasan tesis investasi anggota.",
        meta: "Research kit",
      },
    ],
  },
  {
    title: "Macroeconomics",
    description: "Analisis ekonomi makro",
    icon: BarChart3,
    menu: [
      {
        title: "Indonesia Economic Outlook",
        description: "Inflasi, suku bunga, konsumsi, dan pertumbuhan ekonomi.",
        meta: "Monthly outlook",
      },
      {
        title: "Policy Rate Monitor",
        description: "Ringkasan keputusan BI dan implikasi ke pasar modal.",
        meta: "Data tracker",
      },
      {
        title: "Macro Briefing Deck",
        description: "Materi presentasi untuk diskusi riset mingguan.",
        meta: "Download",
      },
    ],
  },
  {
    title: "Fixed Income",
    description: "Analisis obligasi & suku bunga",
    icon: CircleDollarSign,
    menu: [
      {
        title: "Bond Market Update",
        description: "Yield curve, SUN benchmark, dan sentimen obligasi.",
        meta: "Market note",
      },
      {
        title: "Duration & Convexity Guide",
        description: "Panduan praktis membaca risiko harga obligasi.",
        meta: "Methodology",
      },
      {
        title: "Credit Spread Tracker",
        description: "Perbandingan imbal hasil korporasi dan pemerintah.",
        meta: "Data sheet",
      },
    ],
  },
  {
    title: "Industry Analysis",
    description: "Analisis industri & bisnis",
    icon: TrendingUp,
    menu: [
      {
        title: "Consumer Sector Update",
        description: "Tren margin, daya beli, dan strategi emiten konsumer.",
        meta: "Sector report",
      },
      {
        title: "Digital Economy Radar",
        description: "Peta peluang bisnis teknologi dan platform digital.",
        meta: "Industry notes",
      },
      {
        title: "Company Coverage Map",
        description: "Daftar emiten prioritas untuk riset anggota.",
        meta: "Coverage",
      },
    ],
  },
  {
    title: "Global Market",
    description: "Analisis pasar global",
    icon: Globe2,
    menu: [
      {
        title: "Global Market Weekly",
        description: "Update indeks global, komoditas, dan aliran dana asing.",
        meta: "Weekly insight",
      },
      {
        title: "FX & Commodities Brief",
        description: "Ringkasan USD, minyak, emas, dan dampaknya ke Indonesia.",
        meta: "Market brief",
      },
      {
        title: "Global Risk Dashboard",
        description: "Pantauan risiko geopolitik dan sentimen investor global.",
        meta: "Dashboard",
      },
    ],
  },
];

const featuredResearch = [
  {
    label: "Macroeconomics",
    labelClass: "bg-emerald-100 text-emerald-700",
    title: "Indonesia Economic Outlook 2024",
    date: "8 Mei 2024",
    icon: BarChart3,
  },
  {
    label: "Industry Analysis",
    labelClass: "bg-blue-100 text-primary",
    title: "Consumer Sector Update",
    date: "5 Mei 2024",
    icon: PieChart,
  },
  {
    label: "Fixed Income",
    labelClass: "bg-amber-100 text-amber-700",
    title: "Indonesia Bond Market Update",
    date: "3 Mei 2024",
    icon: CircleDollarSign,
  },
];

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

const publications = [
  {
    title: "Investment Outlook 2024",
    label: "Report",
    description: "Outlook pasar modal Indonesia dan strategi investasi tahun 2024.",
    meta: "PDF - 3.2 MB",
    coverClass: "bg-blue-100 text-primary",
    coverText: "INVESTMENT OUTLOOK 2024",
  },
  {
    title: "Banking Sector Report",
    label: "Sector Report",
    description: "Analisis komprehensif sektor perbankan di Indonesia.",
    meta: "PDF - 2.7 MB",
    coverClass: "bg-emerald-100 text-emerald-700",
    coverText: "SECTOR ANALYSIS BANKING",
  },
  {
    title: "Weekly Market Insight",
    label: "Weekly Report",
    description: "Rangkuman pergerakan pasar dan sentimen investor.",
    meta: "PDF - 1.5 MB",
    coverClass: "bg-violet-100 text-violet-700",
    coverText: "WEEKLY MARKET INSIGHT",
  },
];

const downloads = [
  {
    title: "Financial Model Template",
    meta: "XLSX - 1.1 MB",
    icon: FileSpreadsheet,
    iconClass: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Presentation Template",
    meta: "PPTX - 5.7 MB",
    icon: Presentation,
    iconClass: "bg-orange-100 text-orange-700",
  },
  {
    title: "Research Methodology",
    meta: "PDF - 1.8 MB",
    icon: FileText,
    iconClass: "bg-red-100 text-red-700",
  },
  {
    title: "Glossary of Terms",
    meta: "PDF - 0.9 MB",
    icon: BookOpenText,
    iconClass: "bg-rose-100 text-rose-700",
  },
];

const researchStats = [
  { value: "50+", label: "Research Published", icon: Users },
  { value: "15+", label: "Active Analysts", icon: Users },
  { value: "10K+", label: "Data Points Analyzed", icon: Waypoints },
  { value: "120+", label: "Companies Covered", icon: Landmark },
  { value: "5+", label: "Years of Research", icon: PieChart },
];

const researchEvents = [
  {
    date: "25",
    month: "May",
    type: "Seminar",
    title: "Investment Outlook 2024: Navigating the Uncertainty",
    location: "Auditorium FEB Unpar",
    time: "09.00 - 12.00 WIB",
    image: "/images/research-seminar.png",
  },
  {
    date: "08",
    month: "Jun",
    type: "Workshop",
    title: "Financial Modeling for Investment Analysis",
    location: "Lab. Capital Market",
    time: "13.00 - 16.00 WIB",
    image: "/images/research-modeling.png",
  },
];

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h2 className="text-sm font-bold uppercase text-navy">{title}</h2>
      {action && (
        <Link
          href="/publications"
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

export default function ResearchPageContent() {
  const [activeCategory, setActiveCategory] = useState(researchCategories[0]);

  return (
    <div className="bg-white text-navy">
      <section className="relative overflow-hidden border-b border-blue-50 bg-white">
        <div className="absolute right-0 top-0 h-64 w-72 bg-[radial-gradient(circle_at_center,#93b4ff_1.5px,transparent_1.5px)] opacity-70 [background-size:22px_22px]" />
        <div className="absolute -bottom-16 right-10 h-40 w-40 rounded-full bg-primary-light/70" />

        <div className="container-page relative grid min-h-[460px] items-center gap-10 py-14 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase text-primary">
              Research & Insights
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-navy sm:text-5xl">
              Insight Today,
              <br />
              Better <span className="text-primary">Investment</span> Tomorrow
            </h1>
            <p className="mt-6 max-w-xl text-base font-medium leading-7 text-slate-600">
              Our research provides in-depth analysis and valuable insights to
              help you make smarter investment decisions.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="#featured-research" className="btn-primary">
                Explore Research
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="#downloads" className="btn-secondary">
                Research Methodology
                <FileText className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-lg bg-navy shadow-xl">
              <div className="relative h-[300px] sm:h-[350px]">
                <Image
                  src="/images/research-building.png"
                  alt="Modern office building facade"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-navy-dark/95 via-navy-dark/72 to-navy-dark/15" />
                <div className="absolute inset-0 flex flex-col justify-between p-7 sm:p-8">
                  <div>
                    <span className="inline-flex rounded-lg bg-primary px-3 py-1.5 text-xs font-bold uppercase text-white">
                      Latest Research
                    </span>
                    <h2 className="mt-14 max-w-sm text-2xl font-bold text-white">
                      Indonesia Economic Outlook 2024
                    </h2>
                    <p className="mt-5 max-w-md leading-7 text-blue-50">
                      Peluang dan tantangan sektor perbankan di tengah kondisi
                      ekonomi global.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-blue-50">
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      12 Mei 2024
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      24 Halaman
                    </span>
                  </div>
                </div>
                <Link
                  href="#featured-research"
                  aria-label="Open latest research"
                  className="absolute bottom-8 right-8 flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary shadow-lg transition-transform hover:scale-105"
                >
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="mt-5 flex justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
              <span className="h-2 w-2 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-8">
        <SectionHeader title="Research Categories" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {researchCategories.map((category) => {
            const active = category.title === activeCategory.title;
            return (
              <button
                key={category.title}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-lg border bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                  active
                    ? "border-primary ring-1 ring-primary"
                    : "border-slate-200"
                }`}
              >
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
                  <category.icon className="h-9 w-9" />
                </span>
                <span className="mt-5 block text-sm font-bold text-navy">
                  {category.title}
                </span>
                <span className="mt-3 block text-sm font-medium leading-6 text-slate-600">
                  {category.description}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-blue-50/70 p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase text-primary">
                Selected Category
              </p>
              <h3 className="mt-1 text-xl font-bold text-navy">
                {activeCategory.title}
              </h3>
            </div>
            <Link href="#featured-research" className="btn-secondary bg-white">
              Browse Research
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {activeCategory.menu.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <span className="text-xs font-bold uppercase text-primary">
                  {item.meta}
                </span>
                <h4 className="mt-2 text-base font-bold text-navy">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="featured-research"
        className="container-page border-t border-slate-100 py-8"
      >
        <SectionHeader title="Featured Research" action="View All Research" />
        <div className="grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:grid-cols-[1.55fr_1fr]">
            <div className="p-8">
              <span className="inline-flex rounded-md bg-blue-100 px-2.5 py-1 text-xs font-bold uppercase text-primary">
                Equity Research
              </span>
              <h3 className="mt-8 text-2xl font-bold text-navy">
                Banking Sector Outlook 2024
              </h3>
              <p className="mt-5 max-w-sm leading-7 text-slate-600">
                Peluang dan tantangan sektor perbankan di tengah kondisi ekonomi
                global.
              </p>
              <div className="mt-16 flex flex-wrap items-center gap-8 text-sm font-semibold text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  12 Mei 2024
                </span>
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  24 Halaman
                </span>
              </div>
            </div>
            <div className="relative min-h-[260px] bg-primary-light">
              <Image
                src="/images/research-building.png"
                alt="Banking sector research cover"
                fill
                sizes="(max-width: 768px) 100vw, 330px"
                className="object-cover"
              />
            </div>
          </article>

          <div className="space-y-5">
            {featuredResearch.map((item) => (
              <Link
                key={item.title}
                href="/publications"
                className="group flex items-center gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
                  <item.icon className="h-7 w-7" />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${item.labelClass}`}
                  >
                    {item.label}
                  </span>
                  <span className="mt-2 block text-lg font-bold text-navy">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm font-semibold text-slate-500">
                    {item.date}
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 text-primary transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page border-t border-slate-100 py-8">
        <SectionHeader title="Market Insights & Data" action="View More Data" />
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
      </section>

      <section className="container-page border-t border-slate-100 py-8">
        <SectionHeader
          title="Research Publications"
          action="View All Publications"
        />
        <div className="grid gap-6 lg:grid-cols-3">
          {publications.map((publication) => (
            <article
              key={publication.title}
              className="grid min-h-[170px] grid-cols-[100px_1fr] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div
                className={`flex items-center justify-center p-4 text-center text-sm font-bold uppercase leading-5 ${publication.coverClass}`}
              >
                {publication.coverText}
              </div>
              <div className="flex min-w-0 flex-col p-5">
                <span className="w-fit rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold uppercase text-primary">
                  {publication.label}
                </span>
                <h3 className="mt-3 text-base font-bold text-navy">
                  {publication.title}
                </h3>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                  {publication.description}
                </p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-xs font-semibold uppercase text-slate-500">
                    {publication.meta}
                  </span>
                  <button
                    type="button"
                    aria-label={`Download ${publication.title}`}
                    className="rounded-md p-2 text-slate-500 transition-colors hover:bg-primary-light hover:text-primary"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="downloads"
        className="container-page border-t border-slate-100 py-8"
      >
        <SectionHeader title="Downloads" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {downloads.map((download) => (
            <article
              key={download.title}
              className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${download.iconClass}`}
              >
                <download.icon className="h-6 w-6" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-navy">
                  {download.title}
                </h3>
                <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
                  {download.meta}
                </p>
              </div>
              <button
                type="button"
                aria-label={`Download ${download.title}`}
                className="rounded-md p-2 text-slate-500 transition-colors hover:bg-primary-light hover:text-primary"
              >
                <Download className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_0.95fr]">
        <div className="relative overflow-hidden rounded-lg bg-blue-50 p-8">
          <div className="absolute right-0 top-0 h-44 w-36 bg-[radial-gradient(circle_at_center,#93b4ff_1.5px,transparent_1.5px)] opacity-90 [background-size:18px_18px]" />
          <SectionHeader title="Research By The Numbers" />
          <div className="relative mt-14 grid grid-cols-2 gap-6 sm:grid-cols-5">
            {researchStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                  <stat.icon className="h-7 w-7" />
                </span>
                <p className="mt-4 text-2xl font-bold text-navy">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader title="Upcoming Research Events" />
          <div className="space-y-5">
            {researchEvents.map((event) => (
              <article
                key={event.title}
                className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm sm:grid-cols-[1fr_170px]"
              >
                <div className="flex gap-5 p-5">
                  <div className="flex h-20 w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-primary text-white">
                    <span className="text-3xl font-bold leading-none">
                      {event.date}
                    </span>
                    <span className="mt-1 text-xs font-bold uppercase">
                      {event.month}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold uppercase text-primary">
                      {event.type}
                    </span>
                    <h3 className="mt-2 text-base font-bold leading-6 text-navy">
                      {event.title}
                    </h3>
                    <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {event.time}
                    </p>
                  </div>
                </div>
                <div className="relative min-h-[130px] bg-slate-100">
                  <Image
                    src={event.image}
                    alt=""
                    fill
                    sizes="170px"
                    className="object-cover"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
