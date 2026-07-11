"use client";

import { useState } from "react";
import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import { RESEARCH_ICON_KEYS, getResearchIcon } from "@/lib/researchIcons";

interface ResearchCategoryFormProps {
  action: (formData: FormData) => void;
  category?: {
    id: string;
    title: string;
    description: string | null;
    icon: string;
    order: number;
  };
}

export default function ResearchCategoryForm({
  action,
  category,
}: ResearchCategoryFormProps) {
  const [iconKey, setIconKey] = useState(category?.icon ?? RESEARCH_ICON_KEYS[0]);
  const Icon = getResearchIcon(iconKey);

  return (
    <form action={action} className="space-y-5">
      {category && <input type="hidden" name="id" value={category.id} />}

      <div>
        <label htmlFor="title" className="label">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={category?.title}
          className="input"
        />
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <input
          id="description"
          name="description"
          defaultValue={category?.description ?? ""}
          placeholder="e.g. Analisis saham & sektor"
          className="input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="icon" className="label">
            Icon
          </label>
          <select
            id="icon"
            name="icon"
            value={iconKey}
            onChange={(e) => setIconKey(e.target.value)}
            className="input"
          >
            {RESEARCH_ICON_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
          <div className="mt-2 flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div>
          <label htmlFor="order" className="label">
            Display order
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={category?.order ?? 0}
            className="input"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={category ? "Save changes" : "Add category"} />
        <Link href="/admin/research-categories" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
