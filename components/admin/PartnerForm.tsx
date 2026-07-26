"use client";

import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";
import { PARTNER_CATEGORIES, DEFAULT_PARTNER_CATEGORY } from "@/lib/partners";

interface Props {
  action: (formData: FormData) => void;
  uploadEnabled: boolean;
  partner?: {
    id: string;
    name: string;
    logoUrl: string | null;
    order: number;
    category: string;
  };
}

export default function PartnerForm({ action, uploadEnabled, partner }: Props) {
  return (
    <form action={action} className="space-y-5">
      {partner && <input type="hidden" name="id" value={partner.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">
            Partner name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={partner?.name}
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
            defaultValue={partner?.order ?? 0}
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className="label">
          Section
        </label>
        <select
          id="category"
          name="category"
          defaultValue={partner?.category ?? DEFAULT_PARTNER_CATEGORY}
          className="input"
        >
          {PARTNER_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="mt-1.5 text-xs text-slate-400">
          Which heading this partner appears under on the public site.
        </p>
      </div>

      <ImageField
        label="Logo (optional — shows the name as text if empty)"
        defaultUrl={partner?.logoUrl}
        uploadEnabled={uploadEnabled}
      />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={partner ? "Save changes" : "Add partner"} />
        <Link href="/admin/partners" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
