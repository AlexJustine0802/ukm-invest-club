import Link from "next/link";
import DashboardItemForm from "@/components/admin/DashboardItemForm";
import { requirePage } from "@/lib/adminAccess";
import { createAnnouncement } from "../actions";

export default async function NewAnnouncementPage() {
  await requirePage("announcements", "create");

  return (
    <div>
      <Link
        href="/admin/announcements"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to announcements
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Write announcement</h1>
      <p className="mt-1 text-sm text-slate-500">
        Shown on the member Announcements page and in the dashboard rail.
      </p>
      <div className="mt-6 max-w-2xl">
        <DashboardItemForm
          action={createAnnouncement}
          section="announcement"
          backTo="/admin/announcements"
        />
      </div>
    </div>
  );
}
