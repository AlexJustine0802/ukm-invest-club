import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ResearchCategoryForm from "@/components/admin/ResearchCategoryForm";
import { updateResearchCategory } from "../../actions";
import { requirePage } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function EditResearchCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("research-categories", "edit");

  const { id } = await params;
  const category = await prisma.researchCategory.findUnique({
    where: { id },
  });
  if (!category) notFound();

  return (
    <div>
      <Link
        href="/admin/research-categories"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to research categories
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">
        Edit research category
      </h1>
      <div className="mt-6 max-w-2xl">
        <ResearchCategoryForm
          action={updateResearchCategory}
          category={category}
        />
      </div>
    </div>
  );
}
