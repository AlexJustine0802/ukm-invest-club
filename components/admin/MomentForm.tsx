"use client";

import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";

const CATEGORIES = [
  "Workshop",
  "Company Visit",
  "Research",
  "Seminar",
  "Competition",
  "Bonding",
  "Internal Gathering",
];

interface MomentFormProps {
  action: (formData: FormData) => void;
  uploadEnabled: boolean;
  moment?: {
    id: string;
    title: string;
    category: string;
    date: Date;
    order: number;
    coverImage: string;
  };
}

export default function MomentForm({
  action,
  uploadEnabled,
  moment,
}: MomentFormProps) {
  return (
    <form action={action} className="space-y-5">
      {moment && <input type="hidden" name="id" value={moment.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="title" className="label">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={moment?.title}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="category" className="label">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={moment?.category ?? CATEGORIES[0]}
            className="input"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="label">
            Date
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={moment?.date.toISOString().slice(0, 10)}
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
            defaultValue={moment?.order ?? 0}
            className="input"
          />
        </div>
      </div>

      <ImageField
        label="Cover image"
        defaultUrl={moment?.coverImage}
        uploadEnabled={uploadEnabled}
        required={!moment}
      />

      {!moment && (
        <div>
          <label htmlFor="photoUrls" className="label">
            Additional photo URLs
          </label>
          <textarea
            id="photoUrls"
            name="photoUrls"
            rows={4}
            placeholder={"One image URL per line…"}
            className="input"
          />
          <p className="mt-1 text-xs text-slate-400">
            Extra photos can also be added after creating the moment, from
            its edit page.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={moment ? "Save changes" : "Add moment"} />
        <Link href="/admin/community" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
