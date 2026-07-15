import Link from "next/link";
import { isBlobConfigured } from "@/lib/upload";
import HeroSlideForm from "@/components/admin/HeroSlideForm";
import { createHeroSlide } from "../actions";

export default async function NewHeroSlidePage({
  searchParams,
}: {
  searchParams: Promise<{ loc?: string }>;
}) {
  const { loc } = await searchParams;
  const location = loc === "home-about" ? "home-about" : "home";

  const kind = location === "home-about" ? "home about-us" : "home hero";

  return (
    <div>
      <Link
        href={`/admin/hero-slides?loc=${location}`}
        className="text-sm text-gold-dark hover:text-gold"
      >
        ← Back to slides
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Add {kind} slide</h1>
      <div className="mt-6 max-w-2xl">
        <HeroSlideForm
          action={createHeroSlide}
          uploadEnabled={isBlobConfigured()}
          location={location}
        />
      </div>
    </div>
  );
}
