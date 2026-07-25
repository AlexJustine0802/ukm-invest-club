import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { getResearchIcon } from "@/lib/researchIcons";
import { deleteResearchCategory } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminResearchCategoriesPage() {
  const categories = await prisma.researchCategory.findMany({
    include: { _count: { select: { publications: true } } },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Research Categories</h1>
        <Link href="/admin/research-categories/new" className="btn-primary">
          + Add category
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No categories yet.{" "}
          <Link
            href="/admin/research-categories/new"
            className="text-accent-dark underline"
          >
            Add one
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => {
            const Icon = getResearchIcon(c.icon);
            return (
              <div key={c.id} className="card p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-navy">{c.title}</p>
                    <p className="text-xs text-slate-400">
                      Order: {c.order} · {c._count.publications} publication
                      {c._count.publications === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                {c.description && (
                  <p className="mt-3 text-sm text-slate-500">
                    {c.description}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href={`/admin/research-categories/${c.id}/edit`}
                    className="btn-secondary px-3 py-1.5 text-xs"
                  >
                    Edit
                  </Link>
                  <DeleteButton
                    action={deleteResearchCategory}
                    id={c.id}
                    className="btn-danger px-3 py-1.5 text-xs"
                    confirmMessage="Delete this category? Publications in it will become uncategorized."
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
