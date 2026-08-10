"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, Camera, Check, Trash2 } from "lucide-react";
import {
  updateMyPhoto,
  type ProfileState,
} from "@/app/account/profile/actions";

function Save({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
    >
      {pending ? "Uploading…" : label}
    </button>
  );
}

function Remove() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name="remove"
      value="1"
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-rose-600 disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" />
      Remove
    </button>
  );
}

/**
 * The member's own profile picture.
 *
 * The picked file is previewed from an object URL before it is uploaded, so the
 * member sees what they chose without waiting on the round trip.
 */
export default function ProfilePhotoForm({
  photo,
  initial,
}: {
  photo: string | null;
  /** First letter of the name, shown until there is a photo. */
  initial: string;
}) {
  const [state, action] = useActionState<ProfileState, FormData>(
    updateMyPhoto,
    {},
  );
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const shown = preview ?? photo;

  return (
    <form action={action} className="mt-4 flex flex-wrap items-center gap-5">
      <span className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-primary text-3xl font-bold text-white shadow">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shown}
            alt="Your profile photo"
            className="h-full w-full object-cover"
          />
        ) : (
          initial
        )}
      </span>

      <div className="min-w-0 flex-1 space-y-3">
        <input
          ref={inputRef}
          id="photoFile"
          name="photoFile"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy hover:file:bg-slate-200"
        />
        <p className="text-xs text-slate-400">
          JPG or PNG, up to 5 MB. Square images look best.
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Save label={photo ? "Update photo" : "Upload photo"} />
          {photo && <Remove />}
        </div>

        {state.error && (
          <p className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {state.error}
          </p>
        )}
        {state.saved && !state.error && (
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <Check className="h-4 w-4" />
            Photo updated.
          </p>
        )}
      </div>

      <p className="flex w-full items-center gap-1.5 text-xs text-slate-400">
        <Camera className="h-3.5 w-3.5" />
        Shown on your member card, and on the public About page if you are
        listed in a division.
      </p>
    </form>
  );
}
