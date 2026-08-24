"use client";

import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";

interface Props {
  action: (formData: FormData) => void;
  uploadEnabled: boolean;
  card?: {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    href: string;
    order: number;
  };
}

export default function WaGroupCardForm({ action, uploadEnabled, card }: Props) {
  return (
    <form action={action} className="space-y-5">
      {card && <input type="hidden" name="id" value={card.id} />}

      <div>
        <label htmlFor="title" className="label">Title</label>
        <input id="title" name="title" required defaultValue={card?.title} className="input" />
      </div>

      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea id="description" name="description" rows={4} defaultValue={card?.description ?? ""} className="input" />
      </div>

      <ImageField
        label="Cover image (optional)"
        defaultUrl={card?.imageUrl}
        uploadEnabled={uploadEnabled}
      />

      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <div>
          <label htmlFor="href" className="label">WhatsApp group link</label>
          <input id="href" name="href" type="url" required defaultValue={card?.href} placeholder="https://chat.whatsapp.com/..." className="input" />
        </div>
        <div>
          <label htmlFor="order" className="label">Display order</label>
          <input id="order" name="order" type="number" defaultValue={card?.order ?? 0} className="input" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={card ? "Save changes" : "Add card"} />
        <Link href="/admin/wa-groups" className="btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}
