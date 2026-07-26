import { Suspense } from "react";
import TopBarMenus from "./TopBarMenus";
import TopBarSearch from "./TopBarSearch";
import { getTopBarNotifications } from "@/lib/notifications";

export default async function AccountTopBar({
  title,
  subtitle,
  searchPlaceholder = "Search resources, events, or anything...",
  showSearch = true,
  name,
  initial,
  role,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  searchPlaceholder?: string;
  /** Off on pages with nothing to filter. */
  showSearch?: boolean;
  name: string;
  initial: string;
  role: string;
}) {
  const notifications = await getTopBarNotifications();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {showSearch && (
          <Suspense
            fallback={<div className="h-11 w-full rounded-full border border-slate-200 bg-white lg:w-96" />}
          >
            <TopBarSearch placeholder={searchPlaceholder} />
          </Suspense>
        )}
        {/* Below lg these live in the nav bar instead — anchored to the left
            of a mobile row, the dropdowns opened off the side of the screen. */}
        <div className="hidden lg:flex">
          <TopBarMenus
            name={name}
            initial={initial}
            role={role}
            notifications={notifications}
          />
        </div>
      </div>
    </div>
  );
}
