/**
 * Prints a Cookie header carrying a valid admin + member session, for driving
 * the responsive audit over login-gated pages on a local dev server.
 *
 *   npx tsx --env-file=.env scripts/audit-cookie.ts
 */
import { PrismaClient } from "@prisma/client";
import { createSessionToken } from "../lib/auth";
import { createUserSessionToken } from "../lib/userAuth";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    select: { id: true, email: true },
  });
  if (!user) throw new Error("no User rows to build a member session from");

  const admin = await createSessionToken("audit");
  const member = await createUserSessionToken(user.id, user.email);

  console.log(`icunpar_admin_session=${admin}; icunpar_user_session=${member}`);
}

main().finally(() => prisma.$disconnect());
