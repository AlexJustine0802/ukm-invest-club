import Link from "next/link";
import HighlightForm from "@/components/admin/HighlightForm";
import { createHighlight } from "../actions";
import { requirePage } from "@/lib/adminAccess";

export default async function NewHighlightPage() {
  await requirePage("highlights", "create");

  return (
    <div>
      <Link href="/admin/highlights" className="text-sm text-accent-dark hover:text-accent">
        ← Back to highlights
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Add highlight</h1>
      <div className="mt-6 max-w-2xl">
        <HighlightForm action={createHighlight} />
      </div>
    </div>
  );
}
