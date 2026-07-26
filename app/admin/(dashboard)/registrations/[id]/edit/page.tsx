import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RegistrationFormForm from "@/components/admin/RegistrationFormForm";
import { updateRegistrationForm } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditRegistrationFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [form, categories] = await Promise.all([
    prisma.registrationForm.findUnique({
      where: { id },
      include: { event: true },
    }),
    prisma.eventCategory.findMany({
      orderBy: { order: "asc" },
      select: { id: true, title: true },
    }),
  ]);
  if (!form) notFound();

  return (
    <div>
      <Link href="/admin/registrations" className="text-sm text-accent-dark hover:text-accent">
        ← Back to registrations
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit registration form</h1>
      <p className="mt-1 text-sm text-slate-500">
        Removing a question hides it from the form; answers already submitted stay
        in the responses table.
      </p>
      <div className="mt-6 max-w-3xl">
        <RegistrationFormForm
          action={updateRegistrationForm}
          form={form}
          categories={categories}
          event={form.event}
        />
      </div>
    </div>
  );
}
