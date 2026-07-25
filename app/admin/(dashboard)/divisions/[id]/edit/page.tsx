import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DivisionForm from "@/components/admin/DivisionForm";
import { sortDivisionPeople } from "@/lib/roles";
import { updateDivision } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditDivisionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const division = await prisma.division.findUnique({ where: { id } });
  if (!division) notFound();

  // People are member accounts, not rows owned by this division.
  const people = sortDivisionPeople(
    await prisma.user.findMany({
      where: { division: division.slug },
      select: { id: true, name: true, role: true, photo: true, email: true },
    }),
    division.slug,
  );

  return (
    <div>
      <Link href="/admin/divisions" className="text-sm text-accent-dark hover:text-accent">
        ← Back to divisions
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">{division.name}</h1>

      <div className="mt-6 max-w-2xl">
        <DivisionForm action={updateDivision} division={division} />
      </div>

      {/* People — read-only here; one record per person lives in Members. */}
      <div className="mt-12 max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-navy">People</h2>
            <p className="text-sm text-slate-500">
              Whoever is assigned to this division in Members. Editing them there
              updates the member area and the public About page at once.
            </p>
          </div>
          <Link
            href={`/admin/members?division=${division.slug}`}
            className="btn-primary"
          >
            Manage in Members
          </Link>
        </div>

        {people.length === 0 ? (
          <p className="mt-6 text-slate-500">
            Nobody is assigned to this division yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {people.map((m) => (
              <div key={m.id} className="card flex flex-wrap items-center gap-4 p-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                  {m.photo ? (
                    <Image
                      src={m.photo}
                      alt={m.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      <Users className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-navy">{m.name}</p>
                  <p className="text-sm text-slate-500">{m.role}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{m.email}</p>
                </div>
                <Link
                  href={`/admin/members/${m.id}/edit`}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Edit profile
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
