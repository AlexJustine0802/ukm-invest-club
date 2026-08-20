import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import RegistrationFormForm from "@/components/admin/RegistrationFormForm";
import { updateRegistrationForm, createEventCategoryInline } from "../../actions";
import { requirePage, can } from "@/lib/adminAccess";

export const dynamic = "force-dynamic";

export default async function EditRegistrationFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePage("registrations", "edit");

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

  const mayAddCategory = await can("event-categories", "create");

  return (
    <div>
      <Link href="/admin/recruitment" className="text-sm text-accent-dark hover:text-accent">
        ← Back to recruitments
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit recruitment form</h1>
      <div className="mt-6 max-w-3xl">
        <RegistrationFormForm
          action={updateRegistrationForm}
          uploadEnabled={isBlobConfigured()}
          form={form}
          categories={categories}
          event={form.event}
          createCategory={mayAddCategory ? createEventCategoryInline : undefined}
        />
      </div>
    </div>
  );
}
