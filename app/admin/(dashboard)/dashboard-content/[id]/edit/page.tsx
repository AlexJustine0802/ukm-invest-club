import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardItemForm from "@/components/admin/DashboardItemForm";
import { sectionConfig } from "@/lib/dashboardSections";
import { updateDashboardItem } from "../../actions";
import { requirePage } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function EditDashboardItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("dashboard-content", "edit");

  const { id } = await params;
  const item = await prisma.dashboardItem.findUnique({ where: { id } });
  if (!item) notFound();

  const config = sectionConfig(item.section);

  return (
    <div>
      <Link
        href={`/admin/dashboard-content?section=${config.id}`}
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to {config.label.toLowerCase()}
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit {config.label}</h1>
      <div className="mt-6 max-w-2xl">
        <DashboardItemForm
          action={updateDashboardItem}
          section={item.section}
          item={item}
        />
      </div>
    </div>
  );
}
