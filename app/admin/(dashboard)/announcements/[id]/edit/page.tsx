import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardItemForm from "@/components/admin/DashboardItemForm";
import { requirePage } from "@/lib/adminAccess";
import { updateAnnouncement } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("announcements", "edit");

  const { id } = await params;
  const item = await prisma.dashboardItem.findUnique({ where: { id } });
  if (!item || item.section !== "announcement") notFound();

  return (
    <div>
      <Link
        href="/admin/announcements"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to announcements
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit announcement</h1>
      <div className="mt-6 max-w-2xl">
        <DashboardItemForm
          action={updateAnnouncement}
          section="announcement"
          item={item}
          backTo="/admin/announcements"
        />
      </div>
    </div>
  );
}
