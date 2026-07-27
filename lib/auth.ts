import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const COOKIE_NAME = "icunpar_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  username: string;
}

/** Create a signed session JWT for the given username. */
export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

/** Verify a session token, returning its payload or null if invalid/expired. */
export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.username === "string") {
      return { username: payload.username };
    }
    return null;
  } catch {
    return null;
  }
}

/** Set the session cookie (call from a Server Action / Route Handler). */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/** Remove the session cookie (logout). */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Read and verify the current session from cookies. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/** Throw if there is no valid session  use to guard Server Actions. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized: admin session required");
  }
  return session;
}

/**
 * Resolve the expected bcrypt hash from ADMIN_PASSWORD_HASH.
 *
 * Bcrypt hashes contain `$` characters, which Next.js's dotenv-expand mangles
 * in local `.env` files. To avoid that, the `hash-password` script emits a
 * base64-encoded hash (no `$`). This helper accepts either form:
 *   - a raw bcrypt hash (e.g. set directly in the Vercel dashboard), or
 *   - a base64-encoded bcrypt hash (recommended for `.env`).
 */
function getExpectedHash(): string | null {
  const raw = process.env.ADMIN_PASSWORD_HASH;
  if (!raw) return null;
  if (raw.startsWith("$2")) return raw;
  try {
    const decoded = Buffer.from(raw, "base64").toString("utf8");
    if (decoded.startsWith("$2")) return decoded;
  } catch {
    /* fall through */
  }
  return raw;
}

/** Verify admin username + password against the configured credentials. */
export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedHash = getExpectedHash();
  if (!expectedUser || !expectedHash) return false;
  if (username !== expectedUser) return false;
  return bcrypt.compare(password, expectedHash);
}

/** True when both admin credential env vars are present. */
export function adminCredentialsConfigured(): boolean {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD_HASH);
}

export { COOKIE_NAME };
