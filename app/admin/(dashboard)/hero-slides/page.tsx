import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import DeleteButton from "@/components/admin/DeleteButton";
import SettingsForm from "@/components/admin/SettingsForm";
import { deleteHeroSlide } from "./actions";
import { updateSettings } from "../settings/actions";

export const dynamic = "force-dynamic";

const TABS = [
  { loc: "home", label: "Home hero" },
  { loc: "home-about", label: "Home about-us" },
  { loc: "site", label: "Site images" },
];

const HINTS: Record<string, string> = {
  home: "Big rotating banner on the home page.",
  "home-about": "Image slideshow in the “About Us” section of the home page.",
  site: "One-off pictures (e.g. the About page hero background).",
};

function Tabs({ active }: { active: string }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {TABS.map((tab) => (
        <Link
          key={tab.loc}
          href={`/admin/hero-slides?loc=${tab.loc}`}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            active === tab.loc
              ? "bg-navy text-white"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

export default async function AdminImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string }>;
}) {
  const { loc } = await searchParams;
  const location = TABS.some((t) => t.loc === loc) ? (loc as string) : "home";

  // "Site images" tab = the singleton settings form, not a slide list.
  if (location === "site") {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
    return (
      <div>
        <h1 className="text-2xl font-bold text-navy">Images</h1>
        <p className="mt-1 text-sm text-slate-500">{HINTS.site}</p>
        <Tabs active="site" />
        <div className="mt-6 max-w-2xl">
          <SettingsForm
            action={updateSettings}
            uploadEnabled={isBlobConfigured()}
            settings={settings ?? undefined}
          />
        </div>
      </div>
    );
  }

  const slides = await prisma.heroSlide.findMany({
    where: { location },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  const label = (slide: (typeof slides)[number], index: number) => {
    if (location !== "home-about")
      return (
        `${slide.titleStart ?? ""}${slide.highlight ?? ""}${slide.titleEnd ?? ""}` ||
        "(untitled)"
      );
    return `Slide ${index + 1}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Images</h1>
          <p className="mt-1 text-sm text-slate-500">{HINTS[location]}</p>
        </div>
        <Link
          href={`/admin/hero-slides/new?loc=${location}`}
          className="btn-primary"
        >
          + Add slide
        </Link>
      </div>

      <Tabs active={location} />

      {slides.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No slides yet.{" "}
          <Link
            href={`/admin/hero-slides/new?loc=${location}`}
            className="text-gold-dark underline"
          >
            Add one
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, index) => (
            <div key={slide.id} className="card overflow-hidden">
              <div className="aspect-video bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="font-semibold text-navy">{label(slide, index)}</p>
                {location !== "home-about" && (
                  <p className="text-sm text-slate-500">{slide.eyebrow}</p>
                )}
                <p className="text-xs text-slate-400">Order: {slide.order}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/admin/hero-slides/${slide.id}/edit`}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    Edit
                  </Link>
                  <DeleteButton
                    action={deleteHeroSlide}
                    id={slide.id}
                    className="btn-danger px-3 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
