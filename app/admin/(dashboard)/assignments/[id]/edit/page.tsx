import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AssignmentForm from "@/components/admin/AssignmentForm";
import { updateAssignment } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment) notFound();

  return (
    <div>
      <Link href="/admin/assignments" className="text-sm text-accent-dark hover:text-accent">
        ← Back to assignments
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit assignment</h1>
      <div className="mt-6 max-w-2xl">
        <AssignmentForm action={updateAssignment} assignment={assignment} />
      </div>
    </div>
  );
}
