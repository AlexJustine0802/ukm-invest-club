import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ImpactStatForm from "@/components/admin/ImpactStatForm";
import { updateImpactStat } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditImpactStatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stat = await prisma.impactStat.findUnique({ where: { id } });
  if (!stat) notFound();

  const section = stat.section === "research" ? "research" : "home";
  const backHref =
    section === "research"
      ? "/admin/impact-stats?section=research"
      : "/admin/impact-stats";

  return (
    <div>
      <Link href={backHref} className="text-sm text-gold-dark hover:text-gold">
        ← Back to stats
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit stat</h1>
      <div className="mt-6 max-w-2xl">
        <ImpactStatForm
          action={updateImpactStat}
          section={section}
          stat={stat}
        />
      </div>
    </div>
  );
}
