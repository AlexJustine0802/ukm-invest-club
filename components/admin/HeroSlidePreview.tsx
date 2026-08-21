"use client";

import type { HeroAppearance, HeroStyle } from "@/lib/hero";

export default function HeroSlidePreview({
  images,
  heroStyle,
  appearance,
}: {
  images: string[];
  heroStyle: HeroStyle;
  appearance: HeroAppearance;
}) {
  const fullBackground = heroStyle === "full-background";
  const image = images[0];
  const panel = appearance.strongTextBackground
    ? "border-white/30"
    : "border-white/20";
  const panelStyle = fullBackground && appearance.textBackground
    ? {
        backgroundColor: `rgba(255, 255, 255, ${appearance.panelOpacity / 100})`,
        backdropFilter: `blur(${appearance.panelBlur}px)`,
        WebkitBackdropFilter: `blur(${appearance.panelBlur}px)`,
      }
    : undefined;
  const textTone = "text-navy";
  const mutedTone = "text-slate-600";

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
      <div className="border-b border-slate-200 bg-white px-4 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Live preview
        </p>
      </div>
      <div
        className={`relative min-h-[280px] overflow-hidden ${
          fullBackground ? "bg-slate-900" : "bg-white"
        }`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-[filter] duration-500 ${
              appearance.backgroundBlur ? "scale-105 blur-sm" : ""
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Select an image to preview it here.
          </div>
        )}

        {fullBackground ? (
          <>
            {appearance.darkenBackground && (
              <div className="absolute inset-0 bg-slate-950/55" />
            )}
            {appearance.topGradient && (
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-slate-950/50 to-transparent" />
            )}
            {appearance.bottomGradient && (
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950/70 to-transparent" />
            )}
          </>
        ) : (
          <>
            {appearance.darkenVisual && (
              <div className="absolute inset-y-0 right-0 w-3/5 bg-slate-950/25" />
            )}
            {appearance.softVisualOverlay && (
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent" />
            )}
          </>
        )}

        <div
          className={`relative flex min-h-[280px] items-center p-6 ${
            fullBackground ? "justify-center" : "justify-start"
          }`}
        >
          <div
            style={panelStyle}
            className={`max-w-sm ${
              fullBackground && appearance.textBackground
                ? `rounded-xl border p-5 shadow-xl ${panel}`
                : ""
            }`}
          >
            <p
              className={`text-[10px] font-bold uppercase tracking-[0.18em] text-primary ${
                fullBackground && appearance.textShadow
                  ? "drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)]"
                  : ""
              }`}
            >
              Learn. Analyze. Grow Together.
            </p>
            <h3
              className={`mt-2 text-2xl font-extrabold leading-tight ${textTone} ${
                appearance.textShadow
                  ? "drop-shadow-[0_2px_5px_rgba(0,0,0,0.65)]"
                  : ""
              }`}
            >
              Empowering Future <span className="text-primary">Investors</span>
            </h3>
            <p className={`mt-3 text-xs leading-5 ${mutedTone}`}>
              We are a campus community that shares knowledge, analyzes markets,
              and grows together in the world of investment.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-lg bg-primary px-3 py-1.5 text-[10px] font-semibold text-white">
                Explore Research
              </span>
              <span
                className={`rounded-lg border px-3 py-1.5 text-[10px] font-semibold ${
                  "border-primary text-primary"
                }`}
              >
                View Events
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
