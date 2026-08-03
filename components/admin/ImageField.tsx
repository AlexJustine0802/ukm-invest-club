"use client";

import { useState } from "react";

interface ImageFieldProps {
  label?: string;
  /** Existing image URL (edit mode). */
  defaultUrl?: string | null;
  /** Whether file uploads are configured (Vercel Blob). */
  uploadEnabled?: boolean;
  required?: boolean;
  /** Form field names  override when a form has more than one image. */
  fileName?: string;
  urlName?: string;
}

export default function ImageField({
  label = "Image",
  defaultUrl,
  uploadEnabled = false,
  required = false,
  fileName = "imageFile",
  urlName = "imageUrl",
}: ImageFieldProps) {
  const [preview, setPreview] = useState<string | null>(defaultUrl ?? null);

  return (
    <div>
      <label className="label">{label}</label>

      {uploadEnabled && (
        <input
          type="file"
          name={fileName}
          accept="image/*"
          className="input mb-2 file:mr-3 file:rounded file:border-0 file:bg-navy file:px-3 file:py-1 file:text-white"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
        />
      )}

      <input
        type="url"
        name={urlName}
        placeholder="…or paste an image URL (https://…)"
        defaultValue={defaultUrl ?? ""}
        required={required && !uploadEnabled}
        className="input"
        onChange={(e) => setPreview(e.target.value || null)}
      />

      {!uploadEnabled && (
        <p className="mt-1 text-xs text-slate-400">
           
        </p>
      )}

      {preview && (
        <div className="relative mt-3 aspect-video w-full max-w-xs overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
          {/* Use a plain img for arbitrary/blob preview URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
