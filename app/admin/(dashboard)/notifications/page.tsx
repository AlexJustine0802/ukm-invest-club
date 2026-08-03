import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SubmitButton from "@/components/admin/SubmitButton";
import { requireSuperAdmin } from "@/lib/adminAccess";
import { NOTIFICATION_SOURCES } from "@/lib/notificationSources";
import { updateNotificationSettings } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  await requireSuperAdmin();

  const settings = await prisma.siteSettings.findUnique({ where: { id: 1 } });
  // No settings row yet means nothing has been switched off.
  const isOn = (id: string) =>
    settings ? Boolean(settings[id as keyof typeof settings]) : true;

  return (
    <div>
      <Link
        href="/admin/member-dashboard"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to admin menu
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">
        Member notifications
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">
        What the bell in the member area announces on its own. Announcements are
        not listed  those you write by hand in Dashboard Content, and they are
        always sent.
      </p>

      <form action={updateNotificationSettings} className="mt-6 max-w-2xl">
        <div className="card divide-y divide-slate-100 p-0">
          {NOTIFICATION_SOURCES.map((s) => (
            <label
              key={s.id}
              className="flex cursor-pointer items-start gap-3 p-5"
            >
              <input
                type="checkbox"
                name={s.id}
                defaultChecked={isOn(s.id)}
                className="mt-0.5 h-4 w-4"
              />
              <span>
                <span className="block font-semibold text-navy">{s.label}</span>
                <span className="mt-0.5 block text-xs text-slate-500">
                  {s.description}
                </span>
              </span>
            </label>
          ))}
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Switching a source off hides its rows from the bell for everyone. It
          does not delete anything, and turning it back on brings them back.
        </p>

        <div className="mt-4">
          <SubmitButton label="Save notification settings" />
        </div>
      </form>
    </div>
  );
}
