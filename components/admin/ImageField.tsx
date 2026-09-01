"use client";

import { useRef, useState } from "react";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/uploadLimits";

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
  /** Allow a create form to turn several selected files into slide rows. */
  multiple?: boolean;
  onPreviewChange?: (urls: string[]) => void;
}

export default function ImageField({
  label = "Image",
  defaultUrl,
  uploadEnabled = false,
  required = false,
  fileName = "imageFile",
  urlName = "imageUrl",
  multiple = false,
  onPreviewChange,
}: ImageFieldProps) {
  const [previews, setPreviews] = useState<string[]>(
    defaultUrl ? [defaultUrl] : [],
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  function updatePreviews(urls: string[]) {
    setPreviews(urls);
    onPreviewChange?.(urls);
  }

  function removePreview(index: number) {
    const files = Array.from(fileInputRef.current?.files ?? []);
    if (files.length > 0) {
      const nextFiles = files.filter((_, fileIndex) => fileIndex !== index);
      const transfer = new DataTransfer();
      nextFiles.forEach((file) => transfer.items.add(file));
      if (fileInputRef.current) fileInputRef.current.files = transfer.files;
    }

    if (files.length === 0 && urlInputRef.current) {
      urlInputRef.current.value = "";
    }

    updatePreviews(previews.filter((_, previewIndex) => previewIndex !== index));
  }

  return (
    <div>
      <label className="label">{label}</label>

      <input
        ref={fileInputRef}
        type="file"
        name={fileName}
        accept="image/*"
        multiple={multiple}
        disabled={!uploadEnabled}
        className={`input mb-2 file:mr-3 file:rounded file:border-0 file:bg-navy file:px-3 file:py-1 file:text-white ${
          !uploadEnabled ? "cursor-not-allowed opacity-60" : ""
        }`}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.some((file) => file.size > MAX_UPLOAD_BYTES)) {
            setError(`Each image must be ${MAX_UPLOAD_MB} MB or smaller.`);
            e.currentTarget.value = "";
            updatePreviews([]);
            return;
          }
          setError(null);
          updatePreviews(files.map((file) => URL.createObjectURL(file)));
        }}
      />

      <p className="mb-2 text-xs text-slate-400">
        Maximum image size: {MAX_UPLOAD_MB} MB per file.
      </p>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}

      {uploadEnabled ? (
        <p className="mb-2 text-xs text-slate-400">
          Or paste an image URL below.
        </p>
      ) : (
        <p className="mb-2 text-xs text-amber-600">
          Something wrong.
        </p>
      )}

      <input
        ref={urlInputRef}
        type="url"
        name={urlName}
        placeholder="…or paste an image URL (https://…)"
        defaultValue={defaultUrl ?? ""}
        required={required && !uploadEnabled}
        className="input"
        onChange={(e) => updatePreviews(e.target.value ? [e.target.value] : [])}
      />

      {previews.length > 0 && (
        <div className="mt-3 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map((preview, index) => (
            <div
              key={`${preview}-${index}`}
              className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
            >
              {/* Use a plain img for arbitrary/blob preview URLs. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePreview(index)}
                aria-label={`Remove preview ${index + 1}`}
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/75 text-base leading-none text-white shadow-sm transition-colors hover:bg-red-600"
              >
                ×
              </button>
              {multiple && (
                <span className="absolute left-1.5 top-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {index + 1}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
