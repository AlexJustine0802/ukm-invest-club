import Link from "next/link";
import { isBlobConfigured } from "@/lib/upload";
import GalleryForm from "@/components/admin/GalleryForm";
import { createGalleryImage } from "../actions";

export default function NewGalleryImagePage() {
  return (
    <div>
      <Link
        href="/admin/gallery"
        className="text-sm text-gold-dark hover:text-gold"
      >
        ← Back to gallery
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Add gallery image</h1>
      <div className="mt-6 max-w-2xl">
        <GalleryForm
          action={createGalleryImage}
          uploadEnabled={isBlobConfigured()}
        />
      </div>
    </div>
  );
}
