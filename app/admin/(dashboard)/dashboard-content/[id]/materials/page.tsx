import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Can from "@/components/admin/Can";
import DeleteButton from "@/components/admin/DeleteButton";
import SubmitButton from "@/components/admin/SubmitButton";
import { requirePage } from "@/lib/adminAccess";
import { createResourceMaterial, deleteResourceMaterial } from "./actions";

export const dynamic = "force-dynamic";

export default async function FolderMaterialsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("resource-materials", "view");

  const { id } = await params;
  const folder = await prisma.dashboardItem.findUnique({
    where: { id },
    include: {
      materials: { orderBy: [{ order: "asc" }, { createdAt: "desc" }] },
    },
  });
  if (!folder || folder.section !== "folder") notFound();

  return (
    <div>
      <Link
        href="/admin/dashboard-content?section=folder"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to resource folders
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">{folder.title}</h1>
      <p className="mt-1 text-sm text-slate-500">
        What members see after opening this folder.
        {folder.href && (
          <>
            {" "}
            <span className="font-semibold text-amber-600">
              This folder has a Link set, so clicking it jumps straight to that
              link and members never reach this list.
            </span>{" "}
            Clear the Link on the folder to use these materials instead.
          </>
        )}
      </p>

      <Can module="resource-materials" action="create">
        <form
          action={createResourceMaterial}
          className="card mt-6 max-w-2xl space-y-4 p-5"
        >
          <input type="hidden" name="folderId" value={folder.id} />
          <p className="font-bold text-navy">Add material</p>

          <div>
            <label htmlFor="title" className="label">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="e.g. Week 1 – Reading the Balance Sheet"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="url" className="label">
              Link
            </label>
            <input
              id="url"
              name="url"
              required
              placeholder="https://drive.google.com/..."
              className="input"
            />
            <p className="mt-1 text-xs text-slate-500">
              Any URL  Drive file, slides, video, or a page on this site.
            </p>
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className="input"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="meta" className="label">
                Detail <span className="text-slate-400">(optional)</span>
              </label>
              <input
                id="meta"
                name="meta"
                placeholder="e.g. PDF · 12 pages"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="order" className="label">
                Display order
              </label>
              <input
                id="order"
                name="order"
                type="number"
                defaultValue={0}
                className="input"
              />
            </div>
          </div>

          <SubmitButton label="Add material" />
        </form>
      </Can>

      {folder.materials.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No materials yet. The folder opens to an empty state until you add
          one.
        </p>
      ) : (
        <div className="mt-8 max-w-2xl space-y-3">
          {folder.materials.map((m) => (
            <div key={m.id} className="card flex items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy">{m.title}</p>
                {m.description && (
                  <p className="mt-0.5 text-sm text-slate-600">
                    {m.description}
                  </p>
                )}
                <p className="mt-1 truncate text-xs text-slate-400">
                  Order: {m.order}
                  {m.meta ? ` · ${m.meta}` : ""} · {m.url}
                </p>
              </div>
              <Can module="resource-materials" action="delete">
                <DeleteButton
                  action={deleteResourceMaterial}
                  id={m.id}
                  className="btn-danger px-3 py-1.5 text-xs"
                />
              </Can>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
