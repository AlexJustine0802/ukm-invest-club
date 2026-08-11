import { redirect } from "next/navigation";
import MemberShell from "@/components/account/MemberShell";
import DarkModeScope from "@/components/account/DarkModeScope";
import { getCurrentMember } from "@/lib/currentUser";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentMember();
  if (!user) redirect("/login");

  return (
    <>
      <DarkModeScope />
      <MemberShell user={user}>{children}</MemberShell>
    </>
  );
}
