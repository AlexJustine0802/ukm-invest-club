import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import PublicationForm from "@/components/admin/PublicationForm";
import { updatePublication } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPublicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const publication = await prisma.publication.findUnique({ where: { id } });
  if (!publication) notFound();

  return (
    <div>
      <Link
        href="/admin/publications"
        className="text-sm text-gold-dark hover:text-gold"
      >
        ← Back to publications
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit publication</h1>
      <div className="mt-6 max-w-2xl">
        <PublicationForm
          action={updatePublication}
          uploadEnabled={isBlobConfigured()}
          publication={publication}
        />
      </div>
    </div>
  );
}
