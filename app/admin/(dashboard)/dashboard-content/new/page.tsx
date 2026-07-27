import Link from "next/link";
import DashboardItemForm from "@/components/admin/DashboardItemForm";
import { sectionConfig } from "@/lib/dashboardSections";
import { createDashboardItem } from "../actions";
import { requirePage } from "@/lib/adminAccess";

export default async function NewDashboardItemPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  await requirePage("dashboard-content", "create");

  const { section: sectionParam } = await searchParams;
  const config = sectionConfig(sectionParam);

  return (
    <div>
      <Link
        href={`/admin/dashboard-content?section=${config.id}`}
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to {config.label.toLowerCase()}
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Add to {config.label}</h1>
      <p className="mt-1 text-sm text-slate-500">{config.description}</p>
      <div className="mt-6 max-w-2xl">
        <DashboardItemForm action={createDashboardItem} section={config.id} />
      </div>
    </div>
  );
}
