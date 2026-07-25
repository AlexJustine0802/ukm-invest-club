import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import MomentForm from "@/components/admin/MomentForm";
import DeleteButton from "@/components/admin/DeleteButton";
import SubmitButton from "@/components/admin/SubmitButton";
import {
  updateMoment,
  addMomentPhoto,
  deleteMomentPhoto,
} from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditMomentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const moment = await prisma.moment.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: "asc" } } },
  });
  if (!moment) notFound();

  return (
    <div>
      <Link
        href="/admin/community"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to community
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit moment</h1>
      <div className="mt-6 max-w-2xl">
        <MomentForm
          action={updateMoment}
          uploadEnabled={isBlobConfigured()}
          moment={moment}
        />
      </div>

      <div className="mt-10 max-w-2xl border-t border-slate-200 pt-6">
        <h2 className="text-lg font-bold text-navy">Additional photos</h2>

        {moment.photos.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No extra photos yet.</p>
        ) : (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {moment.photos.map((p) => (
              <div key={p.id} className="space-y-2">
                <div className="aspect-square overflow-hidden rounded-lg bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <DeleteButton
                  action={deleteMomentPhoto}
                  id={p.id}
                  label="Remove"
                  className="btn-danger w-full px-2 py-1 text-xs"
                  confirmMessage="Remove this photo?"
                />
              </div>
            ))}
          </div>
        )}

        <form action={addMomentPhoto} className="mt-5 flex items-end gap-3">
          <input type="hidden" name="momentId" value={moment.id} />
          <div className="flex-1">
            <label htmlFor="imageUrl" className="label">
              Add photo URL
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              required
              placeholder="https://…"
              className="input"
            />
          </div>
          <SubmitButton label="Add photo" pendingLabel="Adding…" />
        </form>
      </div>
    </div>
  );
}
