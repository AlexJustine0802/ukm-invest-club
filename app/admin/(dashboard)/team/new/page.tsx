import Link from "next/link";
import { isBlobConfigured } from "@/lib/upload";
import TeamMemberForm from "@/components/admin/TeamMemberForm";
import { createTeamMember } from "../actions";

export default function NewTeamMemberPage() {
  return (
    <div>
      <Link href="/admin/team" className="text-sm text-accent-dark hover:text-accent">
        ← Back to team
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Add team member</h1>
      <div className="mt-6 max-w-2xl">
        <TeamMemberForm
          action={createTeamMember}
          uploadEnabled={isBlobConfigured()}
        />
      </div>
    </div>
  );
}
