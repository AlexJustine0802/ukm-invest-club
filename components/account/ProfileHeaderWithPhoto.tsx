"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import ProfilePhotoForm from "@/components/account/ProfilePhotoForm";

export default function ProfileHeaderWithPhoto({
  name,
  role,
  photo,
}: {
  name: string;
  role: string;
  photo: string | null;
}) {
  const [photoOpen, setPhotoOpen] = useState(false);
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-28 bg-gradient-to-br from-navy to-primary-dark" />
        <div className="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
          <span className="-mt-12 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-primary text-3xl font-bold text-white">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt={name} className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </span>
          <div className="min-w-0 flex-1 sm:pb-1">
            <h2 className="break-words text-xl font-bold text-navy">{name}</h2>
            <p className="text-sm text-slate-500">{role}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:pb-1">
            <button
              type="button"
              onClick={() => setPhotoOpen((open) => !open)}
              aria-expanded={photoOpen}
              aria-controls="profile-photo-section"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-light"
            >
              Profile Photo
              <ChevronDown
                className={`h-4 w-4 transition-transform ${photoOpen ? "rotate-180" : ""}`}
              />
            </button>
            <Link
              href="/account/settings"
              className="rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-light"
            >
              Edit in Settings
            </Link>
          </div>
        </div>
      </section>

      {photoOpen && (
        <section
          id="profile-photo-section"
          className="rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h3 className="font-bold text-navy">Profile photo</h3>
          <ProfilePhotoForm photo={photo} initial={initial} />
        </section>
      )}
    </div>
  );
}
