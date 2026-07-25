import Link from "next/link";
import ResearchCategoryForm from "@/components/admin/ResearchCategoryForm";
import { createResearchCategory } from "../actions";

export default function NewResearchCategoryPage() {
  return (
    <div>
      <Link
        href="/admin/research-categories"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to research categories
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">
        Add research category
      </h1>
      <div className="mt-6 max-w-2xl">
        <ResearchCategoryForm action={createResearchCategory} />
      </div>
    </div>
  );
}
