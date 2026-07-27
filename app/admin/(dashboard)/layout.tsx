import { redirect } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import MemberShell from "@/components/account/MemberShell";
import PageTransition from "@/components/PageTransition";
import { getAdminActor, hasAdminAccess } from "@/lib/adminAccess";

// A division member is not a super admin, and the browser tab should not tell
// them they are.
export async function generateMetadata() {
  const actor = await getAdminActor();
  return { title: actor?.kind === "member" ? "Admin" : "Super Admin" };
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth  the proxy already blocks /admin for signed-out
  // visitors, but it can only see cookies. This is where the actor is
  // resolved and the two workspaces part ways.
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");

  // A member with permissions gets the admin pages inside the portal chrome
  // they already know: same sidebar, same top bar, only the content changes.
  // No admin.access means no workspace, so they go back to the dashboard
  // rather than land on an empty shell. They are never offered the super
  // admin login  that door is for website administrators only.
  if (actor.kind === "member") {
    if (!(await hasAdminAccess())) redirect("/account");
    return (
      <MemberShell user={actor.user}>
        <div className="mx-auto max-w-5xl">{children}</div>
      </MemberShell>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <Sidebar />
      <main className="min-w-0 flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
