import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Port 6543 is Supabase's transaction pooler: it hands each query whichever
 * backend is free, so a statement prepared on one connection is missing on the
 * next — Postgres 26000, `prepared statement "sN" does not exist`. The
 * `pgbouncer=true` flag tells Prisma to stop using named prepared statements.
 *
 * Without the flag the app still starts and most queries still work, then
 * fails under load. Shouting at boot is far cheaper than diagnosing that
 * again, and this is exactly the flag that gets dropped when copying the URL
 * into a hosting dashboard by hand.
 */
function assertPoolerFlags(url: string | undefined) {
  if (!url) return;
  if (url.includes(":6543") && !url.includes("pgbouncer=true")) {
    console.error(
      "[prisma] DATABASE_URL uses the transaction pooler (:6543) without " +
        "`pgbouncer=true`. Expect intermittent Postgres 26000 " +
        '("prepared statement does not exist") under load. ' +
        "Append ?pgbouncer=true&connection_limit=5&pool_timeout=20",
    );
  }
}

assertPoolerFlags(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
