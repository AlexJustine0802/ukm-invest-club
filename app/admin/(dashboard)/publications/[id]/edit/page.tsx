import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import PublicationForm from "@/components/admin/PublicationForm";
import { updatePublication } from "../../actions";
import { requirePage } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function EditPublicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("publications", "edit");

  const { id } = await params;
  const [publication, categories] = await Promise.all([
    prisma.publication.findUnique({ where: { id } }),
    prisma.researchCategory.findMany({
      orderBy: { order: "asc" },
      select: { id: true, title: true },
    }),
  ]);
  if (!publication) notFound();

  return (
    <div>
      <Link
        href="/admin/publications"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to publications
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit publication</h1>
      <div className="mt-6 max-w-2xl">
        <PublicationForm
          action={updatePublication}
          uploadEnabled={isBlobConfigured()}
          categories={categories}
          publication={publication}
        />
      </div>
    </div>
  );
}
