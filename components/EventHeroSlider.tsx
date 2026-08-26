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
      className="relative mx-auto w-full max-w-[600px] lg:ml-auto lg:mr-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#07152e] via-[#102e68] to-[#1555c8] shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(96,165,250,0.28),transparent_36%)]" />

        <div className="relative z-10 grid gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center sm:gap-7 sm:p-7">
          <div className="min-w-0">
            <span className="inline-flex rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-bold uppercase text-primary">
              {slide.badge ?? "Next Event"}
            </span>
            <h2 className="mt-3 max-w-sm text-xl font-bold leading-6 text-white sm:text-2xl sm:leading-7">
              {slide.title}
            </h2>
            {(slide.dateLabel || slide.timeLabel || slide.location) && (
              <div className="mt-4 space-y-2.5 text-sm font-semibold text-white/85">
                {slide.dateLabel && (
                  <p className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 shrink-0 text-blue-200" />
                    {slide.dateLabel}
                  </p>
                )}
                {slide.timeLabel && (
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-blue-200" />
                    {slide.timeLabel}
                  </p>
                )}
                {slide.location && (
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-blue-200" />
                    {slide.location}
                  </p>
                )}
              </div>
            )}
            <Link
              href={slide.href}
              aria-label={`Open ${slide.title}`}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-primary shadow-lg transition-transform hover:scale-105"
            >
              View event
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border-4 border-white/90 bg-navy/60 shadow-2xl">
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="(max-width: 640px) 100vw, 220px"
            className="object-contain object-center"
          />
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
