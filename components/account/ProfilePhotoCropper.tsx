"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { Camera, Upload, X, ZoomIn } from "lucide-react";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/uploadLimits";

const MAX_PHOTO_BYTES = MAX_UPLOAD_BYTES;
const OUTPUT_SIZE = 512;
const CROP_SIZE = 320;

type ImageSize = { width: number; height: number };
type Offset = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function ProfilePhotoCropper({
  onPreview,
}: {
  onPreview: (url: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [cropSize, setCropSize] = useState(CROP_SIZE);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const sourceUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    offset: Offset;
  } | null>(null);

  const releaseSource = useCallback(() => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = null;
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    releaseSource();
    setSource(null);
    setImageSize(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setDragging(false);
  }, [releaseSource]);

  useEffect(() => {
    return () => {
      releaseSource();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, [releaseSource]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [close, isOpen]);

  const chooseFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That file is not an image.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError(`Image must be ${MAX_UPLOAD_MB} MB or smaller.`);
      return;
    }

    releaseSource();
    const url = URL.createObjectURL(file);
    sourceUrlRef.current = url;
    setSource(url);
    setImageSize(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const layout = (() => {
    if (!imageSize) return null;
    const fitScale = Math.max(
      cropSize / imageSize.width,
      cropSize / imageSize.height,
    );
    const scale = fitScale * zoom;
    const width = imageSize.width * scale;
    const height = imageSize.height * scale;
    const limitX = Math.max(0, (width - cropSize) / 2);
    const limitY = Math.max(0, (height - cropSize) / 2);
    const safeOffset = {
      x: clamp(offset.x, -limitX, limitX),
      y: clamp(offset.y, -limitY, limitY),
    };
    return {
      cropSize,
      scale,
      width,
      height,
      limitX,
      limitY,
      offset: safeOffset,
      left: (cropSize - width) / 2 + safeOffset.x,
      top: (cropSize - height) / 2 + safeOffset.y,
    };
  })();

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!layout) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offset: layout.offset,
    };
    setDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !layout || drag.pointerId !== event.pointerId) return;
    setOffset({
      x: clamp(
        drag.offset.x + event.clientX - drag.startX,
        -layout.limitX,
        layout.limitX,
      ),
      y: clamp(
        drag.offset.y + event.clientY - drag.startY,
        -layout.limitY,
        layout.limitY,
      ),
    });
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setDragging(false);
  };

  const applyCrop = async () => {
    if (!source || !imageSize || !imageRef.current || !layout) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const context = canvas.getContext("2d");
    if (!context) {
      setError("Your browser could not prepare this image.");
      return;
    }

    const sourceWidth = layout.cropSize / layout.scale;
    const sourceX = clamp(
      -layout.left / layout.scale,
      0,
      imageSize.width - sourceWidth,
    );
    const sourceY = clamp(
      -layout.top / layout.scale,
      0,
      imageSize.height - sourceWidth,
    );

    context.drawImage(
      imageRef.current,
      sourceX,
      sourceY,
      sourceWidth,
      sourceWidth,
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE,
    );
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!blob) {
      setError("Your browser could not prepare this image.");
      return;
    }

    const croppedFile = new File([blob], "profile-photo.jpg", {
      type: "image/jpeg",
    });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedFile);
    if (inputRef.current) inputRef.current.files = dataTransfer.files;

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const previewUrl = URL.createObjectURL(croppedFile);
    previewUrlRef.current = previewUrl;
    onPreview(previewUrl);
    close();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm transition-colors hover:border-primary hover:text-primary"
      >
        <Camera className="h-4 w-4" />
        Change photo
      </button>

      <input
        ref={inputRef}
        id="photoFile"
        name="photoFile"
        type="file"
        accept="image/*"
        onChange={(event) => {
          chooseFile(event.target.files?.[0]);
          // The original stays in the cropper only; the form receives a file
          // after the member confirms the crop.
          event.currentTarget.value = "";
        }}
        className="sr-only"
      />

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-photo-dialog-title"
            className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="profile-photo-dialog-title"
                  className="text-lg font-bold text-navy"
                >
                  Change profile photo
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Upload a photo, then adjust its position and zoom.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close photo editor"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {!source ? (
              <label
                htmlFor="photoFile"
                className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center transition-colors hover:border-primary hover:bg-blue-50/50"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
                  <Upload className="h-5 w-5" />
                </span>
                <span className="mt-4 font-semibold text-navy">
                  Choose a photo
                </span>
                <span className="mt-1 text-xs text-slate-400">
                  JPG or PNG, up to {MAX_UPLOAD_MB} MB
                </span>
              </label>
            ) : (
              <>
                <div
                  className={`relative mx-auto mt-6 aspect-square w-full max-w-[320px] touch-none select-none overflow-hidden rounded-xl bg-slate-900 ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={imageRef}
                    src={source}
                    alt="Photo crop preview"
                    draggable={false}
                    onLoad={(event) => {
                      setImageSize({
                        width: event.currentTarget.naturalWidth,
                        height: event.currentTarget.naturalHeight,
                      });
                      setCropSize(
                        event.currentTarget.parentElement?.clientWidth ||
                          CROP_SIZE,
                      );
                    }}
                    className="absolute max-w-none"
                    style={
                      layout
                        ? {
                            width: layout.width,
                            height: layout.height,
                            left: layout.left,
                            top: layout.top,
                          }
                        : {
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                          }
                    }
                  />
                  <div className="pointer-events-none absolute inset-0 border-2 border-white/75" />
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <ZoomIn className="h-4 w-4 text-slate-400" />
                  <label htmlFor="photoZoom" className="sr-only">
                    Zoom photo
                  </label>
                  <input
                    id="photoZoom"
                    type="range"
                    min="1"
                    max="3"
                    step="0.01"
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    className="h-2 flex-1 accent-primary"
                  />
                  <span className="w-12 text-right text-xs font-semibold text-slate-500">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Drag the image to reposition it. Use the slider to zoom.
                </p>
              </>
            )}

            {error && (
              <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              {source ? (
                <button
                  type="button"
                  onClick={applyCrop}
                  disabled={!imageSize}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Use this photo
                </button>
              ) : (
                <label
                  htmlFor="photoFile"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  <Upload className="h-4 w-4" />
                  Choose photo
                </label>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
