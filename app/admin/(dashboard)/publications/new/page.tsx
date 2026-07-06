import Link from "next/link";
import { isBlobConfigured } from "@/lib/upload";
import PublicationForm from "@/components/admin/PublicationForm";
import { createPublication } from "../actions";

export default function NewPublicationPage() {
  return (
    <div>
      <Link
        href="/admin/publications"
        className="text-sm text-gold-dark hover:text-gold"
      >
        ← Back to publications
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">New publication</h1>
      <div className="mt-6 max-w-2xl">
        <PublicationForm
          action={createPublication}
          uploadEnabled={isBlobConfigured()}
        />
      </div>
    </div>
  );
}
