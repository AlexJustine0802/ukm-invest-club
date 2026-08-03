import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RegistrationFormForm from "@/components/admin/RegistrationFormForm";
import { createRegistrationForm, createEventCategoryInline } from "../actions";
import { requirePage, can } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function NewRegistrationFormPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  await requirePage("registrations", "create");

  // Arriving from "+ New event" means an event is what is being made, so the
  // Events tickbox starts on. Coming from Registrations it starts off: most
  // forms are sign-ups, not events.
  const { event } = await searchParams;

  const categories = await prisma.eventCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, title: true },
  });

  const mayAddCategory = await can("event-categories", "create");

  return (
    <div>
      <Link href="/admin/registrations" className="text-sm text-accent-dark hover:text-accent">
        ← Back to registrations
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">
        {event === "1" ? "New event" : "New registration form"}
      </h1>
      <div className="mt-6 max-w-3xl">
        <RegistrationFormForm
          action={createRegistrationForm}
          categories={categories}
          createCategory={mayAddCategory ? createEventCategoryInline : undefined}
          startAsEvent={event === "1"}
        />
      </div>
    </div>
  );
}
