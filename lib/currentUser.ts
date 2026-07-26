import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";

/**
 * The signed-in member's row, fetched once per request.
 *
 * The account layout and every page under it need the same user. Without the
 * cache each one issued its own query, and with a small connection pool those
 * duplicates are what tip a page over into P2024 pool timeouts.
 */
export const getCurrentMember = cache(async function getCurrentMember() {
  const session = await getUserSession();
  if (!session) return null;
  return prisma.user.findUnique({ where: { id: session.userId } });
});
