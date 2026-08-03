import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import RegistrationPanel from "@/components/RegistrationPanel";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const form = await prisma.registrationForm.findUnique({
    where: { slug },
    select: { title: true },
  });
  return { title: form?.title ?? "Registration" };
}

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ done?: string }>;
}) {
  const { slug } = await params;
  const { done } = await searchParams;

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <RegistrationPanel
          slug={slug}
          done={Boolean(done)}
          basePath="/register"
        />
      </div>
    </div>
  );
}
