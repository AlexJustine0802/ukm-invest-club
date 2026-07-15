"use client";

import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";

type Slide = {
  id: string;
  location: string;
  imageUrl: string;
  eyebrow: string | null;
  titleStart: string | null;
  highlight: string | null;
  titleEnd: string | null;
  description: string | null;
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

  return (
    <form action={action} className="space-y-5">
      {slide && <input type="hidden" name="id" value={slide.id} />}
      <input type="hidden" name="location" value={location} />

      <ImageField
        label="Image"
        defaultUrl={slide?.imageUrl}
        uploadEnabled={uploadEnabled}
        required={!slide}
      />

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
