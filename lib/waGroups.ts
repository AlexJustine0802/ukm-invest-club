import { prisma } from "@/lib/prisma";

export async function isWaGroupsEnabled() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 1 },
    select: { whatsappGroupsEnabled: true },
  });
  return settings?.whatsappGroupsEnabled ?? false;
}
