import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isWaGroupsEnabled } from "@/lib/waGroups";
import WaGroupGrid from "@/components/account/WaGroupGrid";

export const metadata: Metadata = { title: "WA GROUP" };
export const dynamic = "force-dynamic";

export default async function WaGroupPage() {
  if (!(await isWaGroupsEnabled())) redirect("/account");
  const cards = await prisma.waGroupCard.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { id: true, title: true, description: true, imageUrl: true, href: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">WA GROUP</h1>
      <p className="mt-1 text-sm text-slate-500">Join the WhatsApp groups that are currently available for members.</p>
      {cards.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center text-sm text-slate-500">No WhatsApp groups are available yet.</div>
      ) : (
        <div className="mt-6"><WaGroupGrid cards={cards} /></div>
      )}
    </div>
  );
}
