"use client";

import SubmitButton from "@/components/admin/SubmitButton";

export type FeaturedItem = {
  id: string;
  label: string;
  sub?: string;
  checked: boolean;
};

interface Props {
  action: (formData: FormData) => void;
  items: FeaturedItem[];
  emptyText?: string;
}

export default function FeaturedSelectForm({
  action,
  items,
  emptyText = "Nothing to select yet.",
}: Props) {
  if (items.length === 0) {
    return <p className="mt-6 text-slate-500">{emptyText}</p>;
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="allIds" value={items.map((i) => i.id).join(",")} />

      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              name="featured"
              value={item.id}
              defaultChecked={item.checked}
              className="h-4 w-4 shrink-0 accent-navy"
            />
            <span className="min-w-0">
              <span className="block font-semibold text-navy">{item.label}</span>
              {item.sub && (
                <span className="block text-xs text-slate-400">{item.sub}</span>
              )}
            </span>
          </label>
        ))}
      </div>

      <SubmitButton label="Save selection" />
    </form>
  );
}
