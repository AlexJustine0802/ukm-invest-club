"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";

export type HeroEventSlide = {
  title: string;
  image: string;
  href: string;
  badge?: string;
  dateLabel?: string;
  timeLabel?: string;
  location?: string;
};

export default function EventHeroSlider({
  slides,
}: {
  slides: HeroEventSlide[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const id = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [paused, slides.length]);

  const slide = slides[active];

  // No slides: hold the exact hero box (h-[315px] / sm:h-[390px]) so the hero
  // row keeps its height instead of the column collapsing.
  if (!slide) {
    return (
      <div className="relative">
        <div className="relative overflow-hidden rounded-lg bg-navy shadow-xl">
          <div className="flex h-[315px] items-center justify-center sm:h-[390px]">
            <p className="px-6 text-center text-sm text-white/60">
              Featured events will appear here soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-lg bg-navy shadow-xl">
        <div className="relative h-[300px] sm:h-[390px]">
          <Image
            src={slide.image}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 650px"
            className="object-cover object-center"
          />
          <div className="absolute inset-x-3 bottom-3 max-w-none rounded-lg bg-white p-4 pr-16 shadow-xl sm:inset-x-7 sm:bottom-7 sm:max-w-sm sm:p-6 sm:pr-16">
            <span className="w-fit rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold uppercase text-primary">
              {slide.badge ?? "Next Event"}
            </span>
            <h2 className="mt-3 text-base font-bold leading-5 text-navy sm:text-lg sm:leading-6">
              {slide.title}
            </h2>
            {(slide.dateLabel || slide.timeLabel || slide.location) && (
              <div className="mt-3 space-y-2 text-sm font-semibold text-slate-600 sm:mt-4">
                {slide.dateLabel && (
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    {slide.dateLabel}
                  </p>
                )}
                {slide.timeLabel && (
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    {slide.timeLabel}
                  </p>
                )}
                {slide.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {slide.location}
                  </p>
                )}
              </div>
            )}
            <Link
              href={slide.href}
              aria-label={`Open ${slide.title}`}
              className="absolute bottom-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-lg ring-1 ring-primary-light transition-transform hover:scale-105"
            >
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      {slides.length > 1 && (
        <div className="mt-5 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setActive(index)}
              className={`h-2 rounded-full transition-all ${
                active === index ? "w-5 bg-primary" : "w-2 bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
