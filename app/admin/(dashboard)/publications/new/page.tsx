import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import PublicationForm from "@/components/admin/PublicationForm";
import { createPublication } from "../actions";
import { requirePage } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function NewPublicationPage() {
  await requirePage("publications", "create");

  const categories = await prisma.researchCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div>
      <Link
        href="/admin/publications"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to publications
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">New publication</h1>
      <div className="mt-6 max-w-2xl">
        <PublicationForm
          action={createPublication}
          uploadEnabled={isBlobConfigured()}
          categories={categories}
        />
      </div>
    </div>
  );
}
