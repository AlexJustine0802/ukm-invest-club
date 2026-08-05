import Link from "next/link";
import CareerAlertForm from "@/components/admin/CareerAlertForm";
import { createCareerAlert } from "../actions";
import { requirePage } from "@/lib/adminAccess";
import { isBlobConfigured } from "@/lib/upload";
import { defaultApplicationQuestions } from "@/lib/forms";

export default async function NewCareerAlertPage() {
  await requirePage("career", "create");

  return (
    <div>
      <Link href="/admin/career" className="text-sm text-accent-dark hover:text-accent">
        ← Back to career alerts
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Post job</h1>
      <div className="mt-6 max-w-2xl">
        <CareerAlertForm
          action={createCareerAlert}
          uploadEnabled={isBlobConfigured()}
          applyQuestions={defaultApplicationQuestions()}
        />
      </div>
    </div>
  );
}
