import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CareerAlertForm from "@/components/admin/CareerAlertForm";
import { updateCareerAlert } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditCareerAlertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const alert = await prisma.careerAlert.findUnique({ where: { id } });
  if (!alert) notFound();

  return (
    <div>
      <Link href="/admin/career" className="text-sm text-accent-dark hover:text-accent">
        ← Back to career alerts
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit job posting</h1>
      <div className="mt-6 max-w-2xl">
        <CareerAlertForm action={updateCareerAlert} alert={alert} />
      </div>
    </div>
  );
}
