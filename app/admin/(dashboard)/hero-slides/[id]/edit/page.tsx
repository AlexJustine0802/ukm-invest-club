import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import HeroSlideForm from "@/components/admin/HeroSlideForm";
import { updateHeroSlide } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditHeroSlidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const slide = await prisma.heroSlide.findUnique({ where: { id } });
  if (!slide) notFound();

  const location = slide.location === "home-about" ? "home-about" : "home";

  return (
    <div>
      <Link
        href={`/admin/hero-slides?loc=${location}`}
        className="text-sm text-gold-dark hover:text-gold"
      >
        ← Back to slides
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit slide</h1>
      <div className="mt-6 max-w-2xl">
        <HeroSlideForm
          action={updateHeroSlide}
          uploadEnabled={isBlobConfigured()}
          location={location}
          slide={slide}
        />
      </div>
    </div>
  );
}
