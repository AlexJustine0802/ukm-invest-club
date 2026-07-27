import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MemberProfileForm from "@/components/admin/MemberProfileForm";
import { updateMemberProfile } from "../../actions";
import { requirePage } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("member-roles", "edit");

  const { id } = await params;
  const member = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      division: true,
      photo: true,
      bio: true,
      instagram: true,
      linkedin: true,
    },
  });
  if (!member) notFound();

  return (
    <div>
      <Link href="/admin/members" className="text-sm text-accent-dark hover:text-accent">
        ← Back to members
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">{member.name}</h1>
      <p className="mt-1 text-sm text-slate-500">
        One record for the member area and the public About page.
      </p>
      <div className="mt-6 max-w-2xl">
        <MemberProfileForm action={updateMemberProfile} member={member} />
      </div>
    </div>
  );
}
