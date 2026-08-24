import Link from "next/link";
import { notFound } from "next/navigation";
import WaGroupCardForm from "@/components/admin/WaGroupCardForm";
import { isBlobConfigured } from "@/lib/upload";
import { prisma } from "@/lib/prisma";
import { requirePage } from "@/lib/adminAccess";
import { updateWaGroupCard } from "../../actions";

export default async function EditWaGroupCardPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePage("wa-groups", "edit");
  const { id } = await params;
  const card = await prisma.waGroupCard.findUnique({ where: { id } });
  if (!card) notFound();

  return (
    <div>
      <Link href="/admin/wa-groups" className="text-sm text-accent-dark hover:text-accent">← Back to WA Group</Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit WA Group card</h1>
      <div className="mt-6 max-w-2xl"><WaGroupCardForm action={updateWaGroupCard} uploadEnabled={isBlobConfigured()} card={card} /></div>
    </div>
  );
}
