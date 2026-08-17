import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";
import { getCurrentMember } from "@/lib/currentUser";
import AccountTopBar from "@/components/account/AccountTopBar";
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

/**
 * The member-area copy of a registration form.
 *
 * Identical to the public page  same panel, same submit  but inside the
 * member chrome. A signed-in member following a Register link should not land
 * on the public site's Login / Sign Up header.
 */
export default async function MemberRegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ done?: string; from?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const user = await getCurrentMember();
  if (!user) redirect("/login");

  const { slug } = await params;
  const { done, from } = await searchParams;

  // Where the back link goes. Only the two areas that link here are accepted,
  // so the parameter cannot be pointed at somewhere else.
  const back =
    from === "recruitment"
      ? { href: "/account/recruitment", label: "Back to Recruitment" }
      : { href: "/account/events", label: "Back to Events" };

  return (
    <>
      <Link
        href={back.href}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        {back.label}
      </Link>

      <AccountTopBar
        title="Registration"
        showSearch={false}
        name={user.name}
        initial={user.name.charAt(0).toUpperCase()}
        role={user.role}
      />

      <div className="mt-8 max-w-3xl">
        <RegistrationPanel
          slug={slug}
          done={Boolean(done)}
          basePath="/account/register"
        />
      </div>
    </>
  );
}
