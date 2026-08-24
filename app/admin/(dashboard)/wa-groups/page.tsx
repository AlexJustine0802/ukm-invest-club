import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import { requireView } from "@/lib/adminAccess";
import Can from "@/components/admin/Can";
import DeleteButton from "@/components/admin/DeleteButton";
import SubmitButton from "@/components/admin/SubmitButton";
import { deleteWaGroupCard, toggleWaGroups } from "./actions";

export const dynamic = "force-dynamic";

export default async function WaGroupsAdminPage() {
  await requireView("wa-groups");
  const [settings, cards] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { id: 1 }, select: { whatsappGroupsEnabled: true } }),
    prisma.waGroupCard.findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] }),
  ]);
  const enabled = settings?.whatsappGroupsEnabled ?? false;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">WA Group</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            Manage the WhatsApp group cards shown to members. Turn the page on when you want the menu to appear.
          </p>
        </div>
        <Can module="wa-groups" action="create">
          <Link href="/admin/wa-groups/new" className="btn-primary">+ Add card</Link>
        </Can>
      </div>

      <Can module="wa-groups" action="edit">
        <form action={toggleWaGroups} className="mt-6 card flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-semibold text-navy">Show WA GROUP in member menu</p>
            <p className="mt-1 text-sm text-slate-500">Switch off to hide the page without deleting any cards.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" name="enabled" defaultChecked={enabled} className="peer sr-only" />
              <span className="h-7 w-12 rounded-full bg-slate-300 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30" />
              <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              <span className="sr-only">{enabled ? "On" : "Off"}</span>
            </label>
            <SubmitButton label="Save visibility" />
          </div>
        </form>
      </Can>

      {cards.length === 0 ? (
        <p className="mt-8 text-slate-500">
          No WA Group cards yet. <Can module="wa-groups" action="create"><Link href="/admin/wa-groups/new" className="text-accent-dark underline">Add one</Link></Can>.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div key={card.id} className="card overflow-hidden">
              <div className="relative aspect-[4/3] bg-slate-100">
                {card.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.imageUrl} alt={card.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-navy p-5 text-center font-bold uppercase text-white">{card.title}</div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-bold text-navy">{card.title}</h2>
                  <span className="shrink-0 text-xs text-slate-400">Order {card.order}</span>
                </div>
                {card.description && <p className="mt-2 line-clamp-3 text-sm text-slate-500">{card.description}</p>}
                <p className="mt-3 truncate text-xs text-primary">{card.href}</p>
                <div className="mt-4 flex items-center gap-2">
                  <Can module="wa-groups" action="edit"><Link href={`/admin/wa-groups/${card.id}/edit`} className="btn-secondary px-3 py-1.5 text-xs">Edit</Link></Can>
                  <Can module="wa-groups" action="delete"><DeleteButton action={deleteWaGroupCard} id={card.id} className="btn-danger px-3 py-1.5 text-xs" /></Can>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
