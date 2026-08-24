import Link from "next/link";
import WaGroupCardForm from "@/components/admin/WaGroupCardForm";
import { isBlobConfigured } from "@/lib/upload";
import { requirePage } from "@/lib/adminAccess";
import { createWaGroupCard } from "../actions";

export default async function NewWaGroupCardPage() {
  await requirePage("wa-groups", "create");
  return (
    <div>
      <Link href="/admin/wa-groups" className="text-sm text-accent-dark hover:text-accent">← Back to WA Group</Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Add WA Group card</h1>
      <div className="mt-6 max-w-2xl"><WaGroupCardForm action={createWaGroupCard} uploadEnabled={isBlobConfigured()} /></div>
    </div>
  );
}
