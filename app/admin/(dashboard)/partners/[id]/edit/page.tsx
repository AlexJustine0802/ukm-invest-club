import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isBlobConfigured } from "@/lib/upload";
import PartnerForm from "@/components/admin/PartnerForm";
import { updatePartner } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partner = await prisma.partner.findUnique({ where: { id } });
  if (!partner) notFound();

  return (
    <div>
      <Link
        href="/admin/partners"
        className="text-sm text-gold-dark hover:text-gold"
      >
        ← Back to partners
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit partner</h1>
      <div className="mt-6 max-w-2xl">
        <PartnerForm
          action={updatePartner}
          uploadEnabled={isBlobConfigured()}
          partner={partner}
        />
      </div>
    </div>
  );
}
