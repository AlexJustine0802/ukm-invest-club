"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/uploadLimits";

interface ImageFieldProps {
  label?: string;
  defaultUrl?: string | null;
  uploadEnabled?: boolean;
  required?: boolean;
  fileName?: string;
  urlName?: string;
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
  const [previews, setPreviews] = useState<string[]>(defaultUrl ? [defaultUrl] : []);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [urlValue, setUrlValue] = useState(defaultUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updatePreviews(urls: string[]) {
    setPreviews(urls);
    onPreviewChange?.(urls);
  }

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    if (files.some((file) => file.size > MAX_UPLOAD_BYTES)) {
      setError(`Each image must be ${MAX_UPLOAD_MB} MB or smaller.`);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const blob = await upload(`uploads/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
        });
        urls.push(blob.url);
      }

      if (multiple) {
        setUploadedUrls((current) => [...current, ...urls]);
        updatePreviews([...previews, ...urls]);
      } else {
        setUploadedUrls(urls.slice(0, 1));
        setUrlValue(urls[0]);
        updatePreviews(urls.slice(0, 1));
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (uploadError) {
      console.error(uploadError);
      setError("Upload failed. Check the Blob token and try again.");
    } finally {
      setUploading(false);
    }
  }

  function removePreview(index: number) {
    const removed = previews[index];
    const next = previews.filter((_, i) => i !== index);
    setUploadedUrls((current) => current.filter((url) => url !== removed));
    if (!multiple && removed === urlValue) setUrlValue("");
    updatePreviews(next);
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
        disabled={!uploadEnabled || uploading}
        className={`input mb-2 file:mr-3 file:rounded file:border-0 file:bg-navy file:px-3 file:py-1 file:text-white ${!uploadEnabled ? "cursor-not-allowed opacity-60" : ""}`}
        onChange={(event) => void uploadFiles(Array.from(event.target.files ?? []))}
      />
      <p className="mb-2 text-xs text-slate-400">
        Maximum image size: {MAX_UPLOAD_MB} MB per file.{uploading ? " Uploading…" : ""}
      </p>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <p className="mb-2 text-xs text-slate-400">
        {uploadEnabled ? "Or paste an image URL below." : "File uploads are not configured. Paste an image URL instead."}
      </p>

      {multiple && uploadedUrls.map((url) => (
        <input key={url} type="hidden" name={urlName} value={url} />
      ))}
      <input
        type={multiple ? "url" : "hidden"}
        name={urlName}
        value={multiple ? undefined : urlValue}
        defaultValue={multiple ? "" : undefined}
        placeholder="…or paste an image URL (https://…)"
        required={required && !uploadEnabled}
        className={multiple ? "input" : "hidden"}
        onChange={(event) => {
          setUrlValue(event.target.value);
          if (!multiple) updatePreviews(event.target.value ? [event.target.value] : []);
        }}
      />

      {previews.length > 0 && (
        <div className="mt-3 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map((preview, index) => (
            <div key={`${preview}-${index}`} className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={`Preview ${index + 1}`} className="h-full w-full object-cover" />
              <button type="button" onClick={() => removePreview(index)} aria-label={`Remove preview ${index + 1}`} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-slate-950/75 text-base leading-none text-white shadow-sm transition-colors hover:bg-red-600">×</button>
              {multiple && <span className="absolute left-1.5 top-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white">{index + 1}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

