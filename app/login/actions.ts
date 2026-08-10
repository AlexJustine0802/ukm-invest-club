"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createUserSessionToken,
  setUserSessionCookie,
  verifyPassword,
} from "@/lib/userAuth";
// TEMPORARILY DISABLED UNTIL PRODUCTION DOMAIN IS VERIFIED
// import { issueAuthToken, siteUrl } from "@/lib/authTokens";
// import { sendAuthEmail } from "@/lib/email";
import type { AuthState } from "@/app/signup/actions";

export async function loginUser(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string) ?? "";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  // TEMPORARILY DISABLED UNTIL PRODUCTION DOMAIN IS VERIFIED
  // Signup no longer sends a link, and the resend below would go out from the
  // Resend test domain, so gating login here would lock out any account whose
  // emailVerified is still null. Re-enable together with the signup block.
  // if (!user.emailVerified) {
  //   const verifyToken = await issueAuthToken(user.id, "VERIFY");
  //   await sendAuthEmail(
  //     user.email,
  //     "verify",
  //     `${siteUrl()}/verify-email?token=${verifyToken}`,
  //   );
  //   return {
  //     error:
  //       "Please verify your email first. We just sent a new verification link to your inbox.",
  //   };
  // }

  const token = await createUserSessionToken(user.id, user.email);
  await setUserSessionCookie(token);
  // ?welcome=1 is what triggers the one-time splash in MemberShell.
  redirect("/account?welcome=1");
}
