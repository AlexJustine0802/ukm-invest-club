import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Moments from ICUnpar events and activities.",
};

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <PageHeader
        title="Gallery"
        subtitle="Moments from our events, workshops, and community activities."
      />
      <div className="container-page py-12">
        {images.length > 0 ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
            {images.map((img) => (
              <figure
                key={img.id}
                className="group relative break-inside-avoid overflow-hidden rounded-xl bg-slate-100"
              >
                <Image
                  src={img.imageUrl}
                  alt={img.title}
                  width={600}
                  height={400}
                  className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {(img.title || img.caption) && (
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent p-4 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="font-semibold">{img.title}</p>
                    {img.caption && (
                      <p className="text-sm text-slate-200">{img.caption}</p>
                    )}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No photos yet — check back soon!</p>
        )}
      </div>
    </div>
  );
}
