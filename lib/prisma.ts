import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Port 6543 is Supabase's transaction pooler: it hands each query whichever
 * backend is free, so a statement prepared on one connection is missing on the
 * next  Postgres 26000, `prepared statement "sN" does not exist`. The
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

/**
 * DATABASE_URL and DIRECT_URL must be the same Supabase project.
 *
 * Migrations run through DIRECT_URL while the app reads DATABASE_URL, so if
 * they drift apart `prisma db push` reports success and the site then fails
 * with "column ... does not exist"  pointing at the schema when the real
 * problem is two different databases. The project ref is the subdomain in the
 * direct host, or the part after "postgres." in a pooler username.
 */
function projectRef(url: string): string | null {
  return (
    /postgres\.([a-z0-9]{16,})/.exec(url)?.[1] ??
    /db\.([a-z0-9]{16,})\.supabase\./.exec(url)?.[1] ??
    null
  );
}

function assertSameProject(runtime?: string, direct?: string) {
  if (!runtime || !direct) return;
  const a = projectRef(runtime);
  const b = projectRef(direct);
  if (a && b && a !== b) {
    console.error(
      `[prisma] DATABASE_URL points at project "${a}" but DIRECT_URL points at ` +
        `"${b}". Migrations would be written to one database and read from the ` +
        `other. Point both at the same project.`,
    );
  }
}

/**
 * The production URL intentionally uses a small pool because a serverless
 * deployment creates one Prisma client per function instance. Next's local
 * development server renders several server components in parallel, though,
 * so the same limit makes ordinary member pages queue until P2024 fires.
 * Give development a little more room without changing the deployed app's
 * connection budget or the values stored in .env. Local development still
 * uses DATABASE_URL. DIRECT_URL is reserved for Prisma migrations and schema
 * operations, so member pages continue using the runtime pooler.
 */
function developmentDatasourceUrl(
  runtimeUrl: string | undefined,
): string | undefined {
  const url = runtimeUrl;
  if (!url || process.env.NODE_ENV !== "development") return url;

  try {
    const parsed = new URL(url);
    parsed.searchParams.set("connection_limit", "10");
    parsed.searchParams.set("pool_timeout", "60");
    return parsed.toString();
  } catch {
    return url;
  }
}

assertPoolerFlags(process.env.DATABASE_URL);
assertSameProject(process.env.DATABASE_URL, process.env.DIRECT_URL);

const datasourceUrl = developmentDatasourceUrl(
  process.env.DATABASE_URL,
);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
