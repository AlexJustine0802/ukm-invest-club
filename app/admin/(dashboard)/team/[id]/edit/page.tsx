import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import TeamMemberForm from "@/components/admin/TeamMemberForm";
import { updateTeamMember } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) notFound();

  return (
    <div>
      <Link href="/admin/team" className="text-sm text-gold-dark hover:text-gold">
        ← Back to team
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit team member</h1>
      <div className="mt-6 max-w-2xl">
        <TeamMemberForm
          action={updateTeamMember}
          uploadEnabled={isBlobConfigured()}
          member={member}
        />
      </div>
    </div>
  );
}
