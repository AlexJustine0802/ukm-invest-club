"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";

export type HeroEventSlide = {
  slug: string;
  title: string;
  image: string;
  dateLabel: string;
  timeLabel: string;
  location: string;
  href: string;
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
  if (!slide) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-lg bg-navy shadow-xl">
        <div className="relative h-[315px] sm:h-[390px]">
          <Image
            src={slide.image}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 650px"
            className="object-cover"
          />
          <div className="absolute inset-x-7 bottom-7 max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <span className="w-fit rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-extrabold uppercase text-primary">
              Next Event
            </span>
            <h2 className="mt-3 text-lg font-extrabold leading-6 text-navy">
              {slide.title}
            </h2>
            <div className="mt-4 space-y-2 text-sm font-semibold text-slate-600">
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {slide.dateLabel}
              </p>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                {slide.timeLabel}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {slide.location}
              </p>
            </div>
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
          {slides.map((s, index) => (
            <button
              key={s.slug}
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
