import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { deletePartner } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  const partners = await prisma.partner.findMany({
    orderBy: [{ order: "asc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Partners</h1>
          <p className="mt-1 text-sm text-slate-500">
            Shown in the “Our Partners” strip on both Home and About.
          </p>
        </div>
        <Link href="/admin/partners/new" className="btn-primary">
          + Add partner
        </Link>
      </div>

      {partners.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No partners yet.{" "}
          <Link href="/admin/partners/new" className="text-accent-dark underline">
            Add one
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {partners.map((partner) => (
            <div key={partner.id} className="card p-4">
              <div className="flex h-16 items-center justify-center rounded-lg bg-slate-50">
                {partner.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={partner.logoUrl}
                    alt={partner.name}
                    className="max-h-12 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-400">
                    {partner.name}
                  </span>
                )}
              </div>
              <p className="mt-3 font-semibold text-navy">{partner.name}</p>
              <p className="text-xs text-slate-400">Order: {partner.order}</p>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={`/admin/partners/${partner.id}/edit`}
                  className="btn-secondary px-3 py-1.5 text-xs"
                >
                  Edit
                </Link>
                <DeleteButton
                  action={deletePartner}
                  id={partner.id}
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
