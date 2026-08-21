"use client";

import Link from "next/link";
import { useState } from "react";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";
import HeroSlidePreview from "@/components/admin/HeroSlidePreview";
import { PUBLIC_PAGE_OPTIONS } from "@/lib/publicPages";
import {
  DEFAULT_FULL_BACKGROUND_APPEARANCE,
  DEFAULT_SPLIT_APPEARANCE,
  heroAppearanceFrom,
  normalizeHeroStyle,
  type HeroAppearance,
  type HeroBooleanKey,
  type HeroStyle,
} from "@/lib/hero";

type Slide = {
  id: string;
  location: string;
  imageUrl: string;
  isActive: boolean;
  heroStyle: string;
  darkenVisual: boolean;
  softVisualOverlay: boolean;
  backgroundBlur: boolean;
  textShadow: boolean;
  darkenBackground: boolean;
  textBackground: boolean;
  strongTextBackground: boolean;
  bottomGradient: boolean;
  topGradient: boolean;
  panelOpacity: number;
  panelBlur: number;
  eyebrow: string | null;
  titleStart: string | null;
  highlight: string | null;
  titleEnd: string | null;
  description: string | null;
  primaryButtonLabel: string | null;
  primaryButtonHref: string | null;
  secondaryButtonLabel: string | null;
  secondaryButtonHref: string | null;
  title: string | null;
  subtitle: string | null;
  caption: string | null;
  icon: string | null;
  order: number;
};

interface Props {
  action: (formData: FormData) => void;
  uploadEnabled: boolean;
  location: "home" | "home-about";
  slide?: Slide;
}

export default function HeroSlideForm({
  action,
  uploadEnabled,
  location,
  slide,
}: Props) {
  const isHome = location !== "home-about";
  const isHomeAbout = location === "home-about";
  const backHref = `/admin/hero-slides?loc=${location}`;
  const initialStyle = normalizeHeroStyle(slide?.heroStyle);
  const [heroStyle, setHeroStyle] = useState<HeroStyle>(initialStyle);
  const [appearance, setAppearance] = useState<HeroAppearance>(() =>
    heroAppearanceFrom(slide ?? {}),
  );
  const [previewImages, setPreviewImages] = useState<string[]>(
    slide?.imageUrl ? [slide.imageUrl] : [],
  );

  const updateAppearance = (key: HeroBooleanKey, value: boolean) => {
    setAppearance((current) => ({ ...current, [key]: value }));
  };

  const updatePanelSetting = (
    key: "panelOpacity" | "panelBlur",
    value: number,
  ) => {
    setAppearance((current) => ({ ...current, [key]: value }));
  };

  const appearanceOptions: Array<[
    HeroBooleanKey,
    string,
    string,
  ]> =
    heroStyle === "split"
      ? [
          ["darkenVisual", "Darken visual", "Add a predefined dark overlay to the right-side visual."],
          ["softVisualOverlay", "Soft visual overlay", "Keep the current fade into the text area."],
          ["backgroundBlur", "Background blur", "Apply a subtle blur to the visual."],
          ["textShadow", "Text shadow", "Improve text contrast with a predefined shadow."],
        ]
      : [
          ["darkenBackground", "Darken background", "Add a dark overlay over the full background."],
          ["textBackground", "Text background", "Wrap the content in a translucent readability panel."],
          ...(appearance.textBackground
            ? [[
                "strongTextBackground",
                "Strong text background",
                "Make the panel more opaque.",
              ] as [HeroBooleanKey, string, string]]
            : []),
          ["backgroundBlur", "Background blur", "Apply a subtle blur to the background."],
          ["bottomGradient", "Bottom gradient", "Add a palette-safe gradient from the bottom."],
          ["topGradient", "Top gradient", "Add a subtle gradient from the top."],
          ["textShadow", "Text shadow", "Improve text contrast with a predefined shadow."],
        ];

  return (
    <form action={action} className="space-y-5">
      {slide && <input type="hidden" name="id" value={slide.id} />}
      <input type="hidden" name="location" value={location} />
      {isHome && <input type="hidden" name="heroStyle" value={heroStyle} />}

      <ImageField
        label={isHome ? "Hero images" : "Image"}
        defaultUrl={slide?.imageUrl}
        uploadEnabled={uploadEnabled}
        required={!slide}
        multiple={isHome}
        onPreviewChange={isHome ? setPreviewImages : undefined}
      />

      {isHome && (
        <>
          <div>
            <p className="label">Hero style</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {([
                ["split", "Split Hero", "Text on the left with the visual on the right."],
                ["full-background", "Full Background", "One full-bleed image with centered content."],
              ] as const).map(([value, title, description]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={heroStyle === value}
                  onClick={() => {
                    setHeroStyle(value);
                    if (value === "split") {
                      setAppearance((current) => ({
                        ...current,
                        ...DEFAULT_SPLIT_APPEARANCE,
                      }));
                    } else {
                      setAppearance((current) => ({
                        ...current,
                        ...DEFAULT_FULL_BACKGROUND_APPEARANCE,
                      }));
                    }
                  }}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    heroStyle === value
                      ? "border-primary bg-primary-light/40 ring-2 ring-primary/20"
                      : "border-slate-200 bg-white hover:border-primary/50"
                  }`}
                >
                  <span className="block text-sm font-bold text-navy">{title}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="label">Appearance</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {appearanceOptions.map(([key, title, description]) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-light/30"
                >
                  <input
                    type="checkbox"
                    name={key}
                    checked={appearance[key]}
                    onChange={(event) => updateAppearance(key, event.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-navy">{title}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">
                      {description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {heroStyle === "full-background" && appearance.textBackground && (
            <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="text-sm font-semibold text-navy">
                  Text panel controls
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Fine-tune how much of the image shows through the text panel.
                </p>
              </div>
              <label className="block">
                <span className="flex items-center justify-between text-sm font-medium text-navy">
                  <span>Panel opacity</span>
                  <output>{appearance.panelOpacity}%</output>
                </span>
                <input
                  type="range"
                  name="panelOpacity"
                  min="0"
                  max="90"
                  step="5"
                  value={appearance.panelOpacity}
                  onChange={(event) =>
                    updatePanelSetting("panelOpacity", Number(event.target.value))
                  }
                  className="mt-3 w-full accent-primary"
                />
                <span className="mt-1 flex justify-between text-[11px] text-slate-400">
                  <span>More transparent</span>
                  <span>More solid</span>
                </span>
              </label>
              <label className="block">
                <span className="flex items-center justify-between text-sm font-medium text-navy">
                  <span>Panel blur</span>
                  <output>{appearance.panelBlur}px</output>
                </span>
                <input
                  type="range"
                  name="panelBlur"
                  min="0"
                  max="24"
                  step="1"
                  value={appearance.panelBlur}
                  onChange={(event) =>
                    updatePanelSetting("panelBlur", Number(event.target.value))
                  }
                  className="mt-3 w-full accent-primary"
                />
                <span className="mt-1 flex justify-between text-[11px] text-slate-400">
                  <span>None</span>
                  <span>Strong</span>
                </span>
              </label>
            </div>
          )}

          <HeroSlidePreview
            images={previewImages}
            heroStyle={heroStyle}
            appearance={appearance}
          />
        </>
      )}

      <div>
        <label htmlFor="order" className="label">
          Display order
        </label>
        <input
          id="order"
          name="order"
          type="number"
          defaultValue={slide?.order ?? 0}
          className="input max-w-[8rem]"
        />
      </div>

      {isHomeAbout ? null : (
        <>
          <div>
            <label htmlFor="eyebrow" className="label">
              Eyebrow (small text above title)
            </label>
            <input
              id="eyebrow"
              name="eyebrow"
              defaultValue={slide?.eyebrow ?? ""}
              className="input"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="titleStart" className="label">
                Title start
              </label>
              <input
                id="titleStart"
                name="titleStart"
                defaultValue={slide?.titleStart ?? ""}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="highlight" className="label">
                Highlight (colored)
              </label>
              <input
                id="highlight"
                name="highlight"
                defaultValue={slide?.highlight ?? ""}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="titleEnd" className="label">
                Title end
              </label>
              <input
                id="titleEnd"
                name="titleEnd"
                defaultValue={slide?.titleEnd ?? ""}
                className="input"
              />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={slide?.description ?? ""}
              className="input"
            />
          </div>
          <div className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <p className="text-sm font-semibold text-navy">Hero buttons</p>
              <p className="mt-1 text-xs text-slate-500">
                Set the label and choose a destination from the public pages.
              </p>
            </div>
            <div>
              <label htmlFor="primaryButtonLabel" className="label">
                Primary button label
              </label>
              <input
                id="primaryButtonLabel"
                name="primaryButtonLabel"
                defaultValue={slide?.primaryButtonLabel ?? ""}
                placeholder="Explore Research"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="primaryButtonHref" className="label">
                Primary button page
              </label>
              <select
                id="primaryButtonHref"
                name="primaryButtonHref"
                defaultValue={slide?.primaryButtonHref ?? "/publications"}
                required
                className="input"
              >
                {PUBLIC_PAGE_OPTIONS.map((page) => (
                  <option key={page.href} value={page.href}>
                    {page.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="secondaryButtonLabel" className="label">
                Secondary button label
              </label>
              <input
                id="secondaryButtonLabel"
                name="secondaryButtonLabel"
                defaultValue={slide?.secondaryButtonLabel ?? ""}
                placeholder="View Events"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="secondaryButtonHref" className="label">
                Secondary button page
              </label>
              <select
                id="secondaryButtonHref"
                name="secondaryButtonHref"
                defaultValue={slide?.secondaryButtonHref ?? "/events"}
                required
                className="input"
              >
                {PUBLIC_PAGE_OPTIONS.map((page) => (
                  <option key={page.href} value={page.href}>
                    {page.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={slide ? "Save changes" : "Add slide"} />
        <Link href={backHref} className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
