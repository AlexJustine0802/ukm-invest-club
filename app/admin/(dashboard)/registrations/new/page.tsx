import Link from "next/link";
import { prisma } from "@/lib/prisma";
import RegistrationFormForm from "@/components/admin/RegistrationFormForm";
import { createRegistrationForm } from "../actions";
import { requirePage } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function NewRegistrationFormPage() {
  await requirePage("registrations", "create");

  const categories = await prisma.eventCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, title: true },
  });

  return (
    <div>
      <Link href="/admin/registrations" className="text-sm text-accent-dark hover:text-accent">
        ← Back to registrations
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">New registration form</h1>
      <div className="mt-6 max-w-3xl">
        <RegistrationFormForm
          action={createRegistrationForm}
          categories={categories}
        />
      </div>
    </div>
  );
}
