import { redirect } from "next/navigation";
import Sidebar from "@/components/account/Sidebar";
import TopBarMenus from "@/components/account/TopBarMenus";
import DrawerProfile from "@/components/account/DrawerProfile";
import PageTransition from "@/components/PageTransition";
import { getCurrentMember } from "@/lib/currentUser";
import { getTopBarNotifications } from "@/lib/notifications";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const notifications = await getTopBarNotifications();

  return (
    // Below lg this stacks: the sidebar renders a sticky bar + drawer instead.
    <div className="min-h-screen bg-slate-50 text-navy lg:flex">
      {/* The bell and profile menu ride in the mobile nav bar; the page's own
          top bar shows them from lg up. */}
      <Sidebar
        menus={
          <TopBarMenus
            name={user.name}
            initial={user.name.charAt(0).toUpperCase()}
            role={user.role}
            notifications={notifications}
            showProfile={false}
          />
        }
        profile={
          <DrawerProfile
            name={user.name}
            initial={user.name.charAt(0).toUpperCase()}
            role={user.role}
          />
        }
      />
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <PageTransition>{children}</PageTransition>
      </div>
    </div>
  );
}
