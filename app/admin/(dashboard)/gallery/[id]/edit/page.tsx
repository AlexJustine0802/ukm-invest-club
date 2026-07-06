import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import GalleryForm from "@/components/admin/GalleryForm";
import { updateGalleryImage } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditGalleryImagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const image = await prisma.galleryImage.findUnique({ where: { id } });
  if (!image) notFound();

  return (
    <div>
      <Link
        href="/admin/gallery"
        className="text-sm text-gold-dark hover:text-gold"
      >
        ← Back to gallery
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit gallery image</h1>
      <div className="mt-6 max-w-2xl">
        <GalleryForm
          action={updateGalleryImage}
          uploadEnabled={isBlobConfigured()}
          image={image}
        />
      </div>
    </div>
  );
}
