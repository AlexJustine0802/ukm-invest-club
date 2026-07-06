import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteTeamMember } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const members = await prisma.teamMember.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Team</h1>
        <Link href="/admin/team/new" className="btn-primary">
          + Add member
        </Link>
      </div>

      {members.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No team members yet.{" "}
          <Link href="/admin/team/new" className="text-gold-dark underline">
            Add one
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div key={member.id} className="card p-5">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-slate-200">
                  {member.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl text-slate-400">
                      👤
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-navy">{member.name}</p>
                  <p className="text-sm text-gold-dark">{member.role}</p>
                  <p className="text-xs text-slate-400">Order: {member.order}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Link
                  href={`/admin/team/${member.id}/edit`}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Edit
                </Link>
                <DeleteButton
                  action={deleteTeamMember}
                  id={member.id}
                  className="btn-danger px-3 py-1.5 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
