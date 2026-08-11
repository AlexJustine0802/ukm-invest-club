"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { LightRays } from "@/components/ui/light-rays";

export type HeroSlideView = {
  eyebrow: string | null;
  titleStart: string | null;
  highlight: string | null;
  titleEnd: string | null;
  description: string | null;
  image: string;
};

// Used when the admin hasn't added any home hero slides yet.
const defaultSlides: HeroSlideView[] = [
  {
    eyebrow: "Learn. Analyze. Grow Together.",
    titleStart: "Empowering Future ",
    highlight: "Investors",
    titleEnd: "",
    description:
      "We are a campus community that shares knowledge, analyzes markets, and grows together in the world of investment.",
    image: "/images/hero-growth.svg",
  },
  {
    eyebrow: "Research. Discuss. Decide.",
    titleStart: "Insight Today, Better ",
    highlight: "Decisions",
    titleEnd: " Tomorrow",
    description:
      "Providing in-depth research and market insight to help students understand finance with sharper perspective.",
    image: "/images/hero-research.svg",
  },
  {
    eyebrow: "Community. Collaboration. Growth.",
    titleStart: "Learn. Share. ",
    highlight: "Grow",
    titleEnd: " Together.",
    description:
      "Join a community of passionate students who believe in continuous learning and long-term growth.",
    image: "/images/hero-community.svg",
  },
];

export default function HeroCarousel({
  slides: slidesProp,
}: {
  slides?: HeroSlideView[];
}) {
  const slides =
    slidesProp && slidesProp.length > 0 ? slidesProp : defaultSlides;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 4500);

    return () => window.clearInterval(id);
  }, [paused]);

  const goTo = (index: number) => setActive(index);

  return (
    <section
      // -mt-16 pulls the hero up under the (transparent-at-top) navbar so the
      // artwork starts at the very top of the page; the matching pt below
      // keeps the copy clear of the bar.
      className="relative -mt-16 overflow-hidden bg-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="relative min-w-full overflow-hidden"
          >
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt=""
                fill
                priority={index === 0}
                className="object-cover object-right"
                sizes="100vw"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, #ffffff 0%, #ffffff 43%, rgba(255,255,255,0.94) 52%, rgba(255,255,255,0.45) 64%, rgba(255,255,255,0) 78%)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-primary-light/45 via-transparent to-white/70" />
            </div>

            <div className="container-page relative z-10 pb-16 pt-[4.5rem] lg:pb-20 lg:pt-[5.5rem]">
              <div className="grid min-h-[520px] items-center gap-10 lg:min-h-[560px] lg:grid-cols-[0.9fr_1.1fr]">
                <div className="max-w-2xl">
                  <span className="text-sm font-semibold uppercase tracking-widest text-primary">
                    {slide.eyebrow}
                  </span>
                  <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-navy sm:text-5xl lg:text-6xl">
                    {slide.titleStart}
                    <span className="text-primary">{slide.highlight}</span>
                    {slide.titleEnd}
                  </h1>
                  <p className="mt-6 max-w-xl text-lg text-slate-600">
                    {slide.description}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <InteractiveHoverButton
                      href="/publications"
                      className="bg-primary text-white"
                      fillClassName="bg-white"
                      hoverTextClassName="text-primary"
                    >
                      Explore Research
                    </InteractiveHoverButton>
                    <InteractiveHoverButton href="/events">
                      <Calendar className="mr-2 inline h-4 w-4" />
                      View Events
                    </InteractiveHoverButton>
                  </div>
                </div>

                <div className="hidden lg:block" aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Above the slide artwork, below the copy (which carries z-10).
          multiply, not the default screen: the slide is white behind the copy,
          and screen-blended rays leave white untouched. */}
      <LightRays blend="multiply" color="rgba(90, 150, 255, 0.35)" />

      <div className="container-page pointer-events-none absolute inset-x-0 bottom-0 top-0">
        <div
          className="pointer-events-auto absolute bottom-12 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-slate-200 bg-white/85 px-2.5 py-1.5 shadow-sm"
        >
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => goTo(index)}
              className={`h-1.5 rounded-full transition-all ${
                active === index ? "w-5 bg-primary" : "w-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
