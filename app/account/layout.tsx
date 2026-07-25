import Sidebar from "@/components/account/Sidebar";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Below lg this stacks: the sidebar renders a sticky bar + drawer instead.
    <div className="min-h-screen bg-slate-50 text-navy lg:flex">
      <Sidebar />
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">{children}</div>
    </div>
  );
}
