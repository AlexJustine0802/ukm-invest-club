import Link from "next/link";
import { isBlobConfigured } from "@/lib/upload";
import MomentForm from "@/components/admin/MomentForm";
import { createMoment } from "../actions";
import { requirePage } from "@/lib/adminAccess";

export default async function NewMomentPage() {
  await requirePage("community", "create");

  return (
    <div>
      <Link
        href="/admin/community"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to community
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Add moment</h1>
      <div className="mt-6 max-w-2xl">
        <MomentForm action={createMoment} uploadEnabled={isBlobConfigured()} />
      </div>
    </div>
  );
}
