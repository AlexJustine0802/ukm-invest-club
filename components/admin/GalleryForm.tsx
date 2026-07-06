"use client";

import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";

interface GalleryFormProps {
  action: (formData: FormData) => void;
  uploadEnabled: boolean;
  image?: {
    id: string;
    title: string;
    caption: string | null;
    order: number;
    imageUrl: string;
  };
}

export default function GalleryForm({
  action,
  uploadEnabled,
  image,
}: GalleryFormProps) {
  return (
    <form action={action} className="space-y-5">
      {image && <input type="hidden" name="id" value={image.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="label">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={image?.title}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="order" className="label">
            Display order
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={image?.order ?? 0}
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="caption" className="label">
          Caption
        </label>
        <input
          id="caption"
          name="caption"
          defaultValue={image?.caption ?? ""}
          className="input"
        />
      </div>

      <ImageField
        label="Image"
        defaultUrl={image?.imageUrl}
        uploadEnabled={uploadEnabled}
        required={!image}
      />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={image ? "Save changes" : "Add image"} />
        <Link href="/admin/gallery" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
