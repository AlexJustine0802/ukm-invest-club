import Link from "next/link";
import AssignmentForm from "@/components/admin/AssignmentForm";
import { createAssignment } from "../actions";
import { requirePage } from "@/lib/adminAccess";

export default async function NewAssignmentPage() {
  await requirePage("assignments", "create");

  return (
    <div>
      <Link href="/admin/assignments" className="text-sm text-accent-dark hover:text-accent">
        ← Back to assignments
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Add assignment</h1>
      <div className="mt-6 max-w-2xl">
        <AssignmentForm action={createAssignment} />
      </div>
    </div>
  );
}
