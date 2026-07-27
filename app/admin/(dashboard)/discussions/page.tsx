import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { getUiIcon } from "@/lib/uiIcons";
import { eventPalette } from "@/lib/eventStyles";
import { deleteChannel } from "./actions";
import Can from "@/components/admin/Can";
import { requireView } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function AdminDiscussionsPage() {
  await requireView("discussions");

  const channels = await prisma.discussionChannel.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { members: true, posts: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Discussion channels</h1>
          <p className="mt-1 text-sm text-slate-500">
            Shown on <code>/account/discussions</code>. Members must join a
            channel before they can read or post in it.
          </p>
        </div>
        <Can module="discussions" action="create">
          <Link href="/admin/discussions/new" className="btn-primary">
            + Add channel
          </Link>
        </Can>
      </div>

      {channels.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No channels yet.{" "}
          <Can module="discussions" action="create">
            <Link href="/admin/discussions/new" className="text-accent-dark underline">
              Add one
            </Link>
          </Can>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {channels.map((c) => {
            const Icon = getUiIcon(c.icon);
            const palette = eventPalette(c.color, c.name);
            return (
              <div key={c.id} className="card flex flex-wrap items-start gap-4 p-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${palette.badge}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-navy">{c.name}</p>
                    {!c.published && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
                        Hidden
                      </span>
                    )}
                  </div>
                  {c.description && (
                    <p className="text-sm text-slate-500">{c.description}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    /{c.slug} · {c._count.members} member
                    {c._count.members === 1 ? "" : "s"} · {c._count.posts} message
                    {c._count.posts === 1 ? "" : "s"} · Order: {c.order}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Can module="discussions" action="edit">
                    <Link
                      href={`/admin/discussions/${c.id}/edit`}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      Edit
                    </Link>
                  </Can>
                  <Can module="discussions" action="delete">
                    <DeleteButton
                      action={deleteChannel}
                      id={c.id}
                      className="btn-danger px-3 py-1.5 text-xs"
                      confirmMessage="Delete this channel? Its messages and memberships go with it. This cannot be undone."
                    />
                  </Can>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
