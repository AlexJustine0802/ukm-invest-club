import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ADMIN_COOKIE = "icunpar_admin_session";
const USER_COOKIE = "icunpar_user_session";

async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login page is always accessible.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // Two kinds of visitor reach /admin: the super admin, and a member whose
  // role has been granted permissions. Both are let through here  the edge
  // only proves *a* valid session exists, because it cannot read the database.
  // Which modules they may actually open is decided in the admin layout and
  // re-checked in every page and server action (lib/adminAccess.ts).
  const valid =
    (await isValidSession(request.cookies.get(ADMIN_COOKIE)?.value)) ||
    (await isValidSession(request.cookies.get(USER_COOKIE)?.value));

  if (!valid) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
