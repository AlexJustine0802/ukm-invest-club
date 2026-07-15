import Link from "next/link";
import ImpactStatForm from "@/components/admin/ImpactStatForm";
import { createImpactStat } from "../actions";

export default async function NewImpactStatPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const { section: sectionParam } = await searchParams;
  const section = sectionParam === "research" ? "research" : "home";
  const backHref =
    section === "research"
      ? "/admin/impact-stats?section=research"
      : "/admin/impact-stats";

  return (
    <div>
      <Link href={backHref} className="text-sm text-gold-dark hover:text-gold">
        ← Back to stats
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">
        Add {section === "research" ? "research" : "impact"} stat
      </h1>
      <div className="mt-6 max-w-2xl">
        <ImpactStatForm action={createImpactStat} section={section} />
      </div>
    </div>
  );
}
