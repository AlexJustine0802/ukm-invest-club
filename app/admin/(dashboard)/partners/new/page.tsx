import Link from "next/link";
import { isBlobConfigured } from "@/lib/upload";
import PartnerForm from "@/components/admin/PartnerForm";
import { createPartner } from "../actions";
import { requirePage } from "@/lib/adminAccess";

export default async function NewPartnerPage() {
  await requirePage("partners", "create");

  return (
    <div>
      <Link
        href="/admin/partners"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to partners
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Add partner</h1>
      <div className="mt-6 max-w-2xl">
        <PartnerForm action={createPartner} uploadEnabled={isBlobConfigured()} />
      </div>
    </div>
  );
}
