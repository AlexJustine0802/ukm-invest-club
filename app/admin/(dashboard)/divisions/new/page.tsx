import Link from "next/link";
import DivisionForm from "@/components/admin/DivisionForm";
import { createDivision } from "../actions";

export default function NewDivisionPage() {
  return (
    <div>
      <Link href="/admin/divisions" className="text-sm text-accent-dark hover:text-accent">
        ← Back to divisions
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Add division</h1>
      <p className="mt-1 text-sm text-slate-500">
        Save first, then add the head and managers.
      </p>
      <div className="mt-6 max-w-2xl">
        <DivisionForm action={createDivision} />
      </div>
    </div>
  );
}
