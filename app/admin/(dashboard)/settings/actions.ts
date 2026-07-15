"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { resolveImage } from "@/lib/upload";

export async function updateSettings(formData: FormData) {
  await requireSession();

  const existing = await prisma.siteSettings.findUnique({ where: { id: 1 } });

  const homeAboutImage =
    (await resolveImage(
      formData.get("homeAboutFile") as File | null,
      formData.get("homeAboutUrl") as string | null,
    )) ?? existing?.homeAboutImage ?? null;

  const aboutHeroImage =
    (await resolveImage(
      formData.get("aboutHeroFile") as File | null,
      formData.get("aboutHeroUrl") as string | null,
    )) ?? existing?.aboutHeroImage ?? null;

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: { homeAboutImage, aboutHeroImage },
    create: { id: 1, homeAboutImage, aboutHeroImage },
  });

  revalidatePath("/");
  revalidatePath("/about");
  redirect("/admin/hero-slides?loc=site");
}
