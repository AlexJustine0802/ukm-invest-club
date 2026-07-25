import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export type AuthTokenType = "RESET";

const TTL_MS: Record<AuthTokenType, number> = {
  RESET: 60 * 60 * 1000, // 1 hour
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Issue a single-use token for a user. Any existing token of the same type is
 * dropped first, so only the newest link ever works. Returns the raw token —
 * it is never stored, only its hash.
 */
export async function issueAuthToken(
  userId: string,
  type: AuthTokenType,
): Promise<string> {
  const token = randomBytes(32).toString("hex");

  await prisma.authToken.deleteMany({ where: { userId, type } });
  await prisma.authToken.create({
    data: {
      tokenHash: hashToken(token),
      type,
      userId,
      expiresAt: new Date(Date.now() + TTL_MS[type]),
    },
  });

  return token;
}

/**
 * Validate and consume a token. Returns the userId on success, null if the
 * token is unknown, of the wrong type, or expired. Always deletes the row, so
 * a token cannot be replayed.
 */
export async function consumeAuthToken(
  token: string,
  type: AuthTokenType,
): Promise<string | null> {
  if (!token) return null;

  const record = await prisma.authToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.type !== type) return null;

  await prisma.authToken.delete({ where: { id: record.id } });

  if (record.expiresAt < new Date()) return null;
  return record.userId;
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
