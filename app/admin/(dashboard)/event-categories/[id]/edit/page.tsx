import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EventCategoryForm from "@/components/admin/EventCategoryForm";
import { updateEventCategory } from "../../actions";
import { requirePage } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function EditEventCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("event-categories", "edit");

  const { id } = await params;
  const category = await prisma.eventCategory.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <Link
        href="/admin/event-categories"
        className="text-sm text-accent-dark hover:text-accent"
      >
        ← Back to event categories
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">
        Edit event category
      </h1>
      <div className="mt-6 max-w-2xl">
        <EventCategoryForm
          action={updateEventCategory}
          category={category}
        />
      </div>
    </div>
  );
}
