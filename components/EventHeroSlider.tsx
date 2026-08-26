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
      className="relative mx-auto w-full max-w-[540px] lg:ml-auto lg:mr-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[330px] overflow-hidden rounded-lg bg-gradient-to-br from-[#07152e] via-[#102e68] to-[#1555c8] shadow-xl sm:h-[360px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(96,165,250,0.28),transparent_36%)]" />

        <div className="relative z-10 h-full p-5 pb-36 sm:p-7 sm:pr-56 sm:pb-7">
          <span className="inline-flex rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold uppercase text-primary">
            {slide.badge ?? "Next Event"}
          </span>
          <h2 className="mt-3 max-w-sm text-xl font-bold leading-6 text-white sm:text-2xl sm:leading-7">
            {slide.title}
          </h2>
          {(slide.dateLabel || slide.timeLabel || slide.location) && (
            <div className="mt-4 space-y-2 text-sm font-semibold text-white/85">
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
            className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary shadow-lg transition-transform hover:scale-105 sm:bottom-7 sm:right-7"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="absolute bottom-4 left-4 h-28 w-48 overflow-hidden rounded-lg border-4 border-white bg-navy shadow-xl sm:bottom-5 sm:left-5 sm:h-32 sm:w-56">
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            sizes="(max-width: 640px) 192px, 224px"
            className="object-contain object-center"
          />
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
