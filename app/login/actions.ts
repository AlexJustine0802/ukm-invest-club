"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createUserSessionToken,
  setUserSessionCookie,
  verifyPassword,
} from "@/lib/userAuth";
import { issueAuthToken, siteUrl } from "@/lib/authTokens";
import { sendAuthEmail } from "@/lib/email";
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

  // Credentials are valid but the address is unconfirmed — send a fresh link
  // so an expired one is never a dead end.
  if (!user.emailVerified) {
    const token = await issueAuthToken(user.id, "VERIFY");
    await sendAuthEmail(
      user.email,
      "verify",
      `${siteUrl()}/verify-email?token=${token}`,
    );
    return {
      error:
        "Please verify your email first. We just sent a new verification link to your inbox.",
    };
  }

  const token = await createUserSessionToken(user.id, user.email);
  await setUserSessionCookie(token);
  redirect("/account");
}
