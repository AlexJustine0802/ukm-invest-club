import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteGalleryImage } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Gallery</h1>
        <Link href="/admin/gallery/new" className="btn-primary">
          + Add image
        </Link>
      </div>

      {images.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No images yet.{" "}
          <Link href="/admin/gallery/new" className="text-gold-dark underline">
            Add one
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((img) => (
            <div key={img.id} className="card overflow-hidden">
              <div className="aspect-video bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={img.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="font-semibold text-navy">{img.title}</p>
                {img.caption && (
                  <p className="text-sm text-slate-500">{img.caption}</p>
                )}
                <p className="text-xs text-slate-400">Order: {img.order}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/admin/gallery/${img.id}/edit`}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    Edit
                  </Link>
                  <DeleteButton
                    action={deleteGalleryImage}
                    id={img.id}
                    className="btn-danger px-3 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
