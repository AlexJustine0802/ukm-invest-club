import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import DeleteButton from "@/components/admin/DeleteButton";
import { deletePublication } from "./actions";
import Can from "@/components/admin/Can";
import { requireView } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function AdminPublicationsPage() {
  await requireView("publications");

  const publications = await prisma.publication.findMany({
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Publications</h1>
        <Can module="publications" action="create">
          <Link href="/admin/publications/new" className="btn-primary">
            + New publication
          </Link>
        </Can>
      </div>

      {publications.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No publications yet.{" "}
          <Can module="publications" action="create">
            <Link
              href="/admin/publications/new"
              className="text-accent-dark underline"
            >
              Write your first one
            </Link>
          </Can>
          .
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Published</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {publications.map((pub) => (
                <tr key={pub.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{pub.title}</p>
                    {pub.author && (
                      <p className="text-xs text-slate-400">{pub.author}</p>
                    )}
                    {pub.featured && (
                      <span className="badge mt-1 bg-primary-light text-primary">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {pub.category?.title ?? ""}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDate(pub.publishedAt)}
                  </td>
                  <td className="px-4 py-3">
                    {pub.published ? (
                      <span className="badge bg-emerald/10 text-emerald">
                        Published
                      </span>
                    ) : (
                      <span className="badge bg-amber-100 text-amber-700">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Can module="publications" action="edit">
                        <Link
                          href={`/admin/publications/${pub.id}/edit`}
                          className="btn-secondary px-3 py-1.5 text-xs"
                        >
                          Edit
                        </Link>
                      </Can>
                      <Can module="publications" action="delete">
                        <DeleteButton
                          action={deletePublication}
                          id={pub.id}
                          className="btn-danger px-3 py-1.5 text-xs"
                        />
                      </Can>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
