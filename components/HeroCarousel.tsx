"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { heroAppearanceFrom, normalizeHeroStyle } from "@/lib/hero";

export type HeroSlideView = {
  id?: string;
  eyebrow: string | null;
  titleStart: string | null;
  highlight: string | null;
  titleEnd: string | null;
  description: string | null;
  primaryButtonLabel: string | null;
  primaryButtonHref: string | null;
  secondaryButtonLabel: string | null;
  secondaryButtonHref: string | null;
  heroStyle?: string | null;
  darkenVisual?: boolean | null;
  softVisualOverlay?: boolean | null;
  backgroundBlur?: boolean | null;
  textShadow?: boolean | null;
  darkenBackground?: boolean | null;
  textBackground?: boolean | null;
  strongTextBackground?: boolean | null;
  bottomGradient?: boolean | null;
  topGradient?: boolean | null;
  panelOpacity?: number | null;
  panelBlur?: number | null;
  image: string;
};

const defaultSlides: HeroSlideView[] = [
  {
    eyebrow: "Learn. Analyze. Grow Together.",
    titleStart: "Empowering Future ",
    highlight: "Investors",
    titleEnd: "",
    description:
      "We are a campus community that shares knowledge, analyzes markets, and grows together in the world of investment.",
    primaryButtonLabel: "Explore Research",
    primaryButtonHref: "/publications",
    secondaryButtonLabel: "View Events",
    secondaryButtonHref: "/events",
    heroStyle: "split",
    softVisualOverlay: true,
    image: "/images/hero-growth.svg",
  },
  {
    eyebrow: "Research. Discuss. Decide.",
    titleStart: "Insight Today, Better ",
    highlight: "Decisions",
    titleEnd: " Tomorrow",
    description:
      "Providing in-depth research and market insight to help students understand finance with sharper perspective.",
    primaryButtonLabel: "Explore Research",
    primaryButtonHref: "/publications",
    secondaryButtonLabel: "View Events",
    secondaryButtonHref: "/events",
    heroStyle: "split",
    softVisualOverlay: true,
    image: "/images/hero-research.svg",
  },
  {
    eyebrow: "Community. Collaboration. Growth.",
    titleStart: "Learn. Share. ",
    highlight: "Grow",
    titleEnd: " Together.",
    description:
      "Join a community of passionate students who believe in continuous learning and long-term growth.",
    primaryButtonLabel: "Explore Research",
    primaryButtonHref: "/publications",
    secondaryButtonLabel: "View Events",
    secondaryButtonHref: "/events",
    heroStyle: "split",
    softVisualOverlay: true,
    image: "/images/hero-community.svg",
  },
];

function buttonValues(slide: HeroSlideView) {
  return {
    primary: {
      label: slide.primaryButtonLabel || "Explore Research",
      href: slide.primaryButtonHref || "/publications",
    },
    secondary: {
      label: slide.secondaryButtonLabel || "View Events",
      href: slide.secondaryButtonHref || "/events",
    },
  };
}

export default function HeroCarousel({ slides: slidesProp }: { slides?: HeroSlideView[] }) {
  const slides = slidesProp && slidesProp.length > 0 ? slidesProp : defaultSlides;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  const activeIndex = Math.min(active, slides.length - 1);
  const activeSlide = slides[activeIndex];
  const heroStyle = normalizeHeroStyle(activeSlide.heroStyle);
  const fullBackground = heroStyle === "full-background";
  const appearance = heroAppearanceFrom(activeSlide);
  const buttons = buttonValues(activeSlide);
  const textShadow = appearance.textShadow
    ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]"
    : "";
  const panelStyle = fullBackground && appearance.textBackground
    ? {
        backgroundColor: `rgba(255, 255, 255, ${appearance.panelOpacity / 100})`,
        backdropFilter: `blur(${appearance.panelBlur}px)`,
        WebkitBackdropFilter: `blur(${appearance.panelBlur}px)`,
      }
    : undefined;

  return (
    <section
      className={`relative -mt-16 overflow-hidden ${fullBackground ? "bg-slate-950" : "bg-white"}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0" aria-hidden="true">
        {slides.map((slide, index) => {
          const slideStyle = normalizeHeroStyle(slide.heroStyle);
          const slideAppearance = heroAppearanceFrom(slide);
          const slideFullBackground = slideStyle === "full-background";

          return (
            <motion.div
              key={slide.id ?? `${slide.image}-${index}`}
              className="absolute inset-0"
              initial={false}
              animate={{ opacity: activeIndex === index ? 1 : 0 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                className={`object-cover ${slideFullBackground ? "object-center" : "object-right"} ${slideAppearance.backgroundBlur ? "scale-105 blur-sm" : ""}`}
                sizes="100vw"
              />
              {slideFullBackground ? (
                <>
                  {slideAppearance.darkenBackground && <div className="absolute inset-0 bg-slate-950/55" />}
                  {slideAppearance.topGradient && <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-slate-950/55 to-transparent" />}
                  {slideAppearance.bottomGradient && <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950/75 to-transparent" />}
                </>
              ) : (
                <>
                  {slideAppearance.darkenVisual && <div className="absolute inset-y-0 right-0 w-3/5 bg-slate-950/25" />}
                  {slideAppearance.softVisualOverlay && <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent" />}
                  <div className="absolute inset-0 bg-gradient-to-b from-primary-light/45 via-transparent to-white/70" />
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className={`container-page relative z-10 ${fullBackground ? "flex min-h-[560px] items-center justify-center pb-20 pt-28 lg:min-h-[620px]" : "pb-20 pt-[3.75rem] lg:min-h-[560px] lg:pb-24 lg:pt-[4.75rem]"}`}>
        <div className={fullBackground ? "w-full max-w-2xl" : "grid min-h-[520px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]"}>
          <div
            style={panelStyle}
            className={`${fullBackground ? appearance.textBackground ? `mx-auto w-full rounded-2xl border p-6 shadow-2xl sm:p-8 ${appearance.strongTextBackground ? "border-white/35" : "border-white/30"}` : "mx-auto w-full" : "max-w-2xl"} ${fullBackground ? "text-center" : ""}`}
          >
            <span className={`site-hero-eyebrow ${textShadow}`}>
              {activeSlide.eyebrow}
            </span>
            <h1 className={`site-hero-title mt-4 ${textShadow}`}>
              {activeSlide.titleStart}
              {activeSlide.titleStart &&
              activeSlide.highlight &&
              !/\s$/.test(activeSlide.titleStart)
                ? " "
                : null}
              <span className="text-primary">{activeSlide.highlight}</span>
              {activeSlide.highlight &&
              activeSlide.titleEnd &&
              !/^\s/.test(activeSlide.titleEnd)
                ? " "
                : null}
              {activeSlide.titleEnd}
            </h1>
            <p className={`site-hero-copy mt-6 max-w-xl ${fullBackground ? "mx-auto" : ""} ${textShadow}`}>
              {activeSlide.description}
            </p>
            <div className={`site-hero-actions ${fullBackground ? "justify-center" : ""}`}>
              <InteractiveHoverButton href={buttons.primary.href} className="bg-primary text-white" fillClassName="bg-white" hoverTextClassName="text-primary">
                {buttons.primary.label}
              </InteractiveHoverButton>
              <InteractiveHoverButton href={buttons.secondary.href} className="border-primary bg-transparent text-primary">
                {buttons.secondary.href.startsWith("/events") && <Calendar className="mr-2 inline h-4 w-4" />}
                {buttons.secondary.label}
              </InteractiveHoverButton>
            </div>
          </div>
          {!fullBackground && <div className="hidden lg:block" aria-hidden="true" />}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="container-page pointer-events-none absolute inset-x-0 bottom-0">
          <div className="pointer-events-auto absolute bottom-12 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-slate-200 bg-white/85 px-2.5 py-1.5 shadow-sm">
            {slides.map((slide, index) => (
              <button
                key={slide.id ?? `${slide.image}-${index}`}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={activeIndex === index ? "true" : undefined}
                onClick={() => setActive(index)}
                className={`h-1.5 rounded-full transition-all ${activeIndex === index ? "w-5 bg-primary" : "w-1.5 bg-slate-300"}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
