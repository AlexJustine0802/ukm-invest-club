import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HighlightForm from "@/components/admin/HighlightForm";
import { updateHighlight } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditHighlightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const highlight = await prisma.highlight.findUnique({ where: { id } });
  if (!highlight) notFound();

  return (
    <div>
      <Link href="/admin/highlights" className="text-sm text-accent-dark hover:text-accent">
        ← Back to highlights
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit highlight</h1>
      <div className="mt-6 max-w-2xl">
        <HighlightForm action={updateHighlight} highlight={highlight} />
      </div>
    </div>
  );
}
