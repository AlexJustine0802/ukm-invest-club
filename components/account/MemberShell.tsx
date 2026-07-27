import Sidebar from "@/components/account/Sidebar";
import TopBarMenus from "@/components/account/TopBarMenus";
import DrawerProfile from "@/components/account/DrawerProfile";
import PageTransition from "@/components/PageTransition";
import { getTopBarNotifications } from "@/lib/notifications";
import { hasAdminAccess } from "@/lib/adminAccess";

/**
 * The member portal frame: sidebar, mobile bar and drawer, page transition.
 *
 * It lives in its own component because the admin workspace renders it too.
 * A member with permissions opens /admin inside this exact chrome  same
 * sidebar, same top bar, same theme  and only the content area changes. Two
 * copies of this markup would drift, and the whole point is that the two
 * places look identical.
 */
export default async function MemberShell({
  user,
  children,
}: {
  user: { name: string; role: string };
  children: React.ReactNode;
}) {
  const notifications = await getTopBarNotifications();
  const showAdmin = await hasAdminAccess();
  const initial = user.name.charAt(0).toUpperCase();

  return (
    // Below lg this stacks: the sidebar renders a sticky bar + drawer instead.
    <div className="min-h-screen bg-slate-50 text-navy lg:flex">
      {/* The bell and profile menu ride in the mobile nav bar; the page's own
          top bar shows them from lg up. */}
      <Sidebar
        showAdmin={showAdmin}
        menus={
          <TopBarMenus
            name={user.name}
            initial={initial}
            role={user.role}
            notifications={notifications}
            showProfile={false}
          />
        }
        profile={
          <DrawerProfile name={user.name} initial={initial} role={user.role} />
        }
      />
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
