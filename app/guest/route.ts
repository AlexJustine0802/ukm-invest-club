import { NextResponse } from "next/server";
import { createUserSessionToken, setUserSessionCookie } from "@/lib/userAuth";

// "Skip ahead" for the Google/Microsoft buttons: start a guest session.
export async function GET(request: Request) {
  const token = await createUserSessionToken("guest", "guest@icu.local");
  await setUserSessionCookie(token);
  return NextResponse.redirect(new URL("/account", request.url));
}
