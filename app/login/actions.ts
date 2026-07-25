"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createUserSessionToken,
  setUserSessionCookie,
  verifyPassword,
} from "@/lib/userAuth";
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

  // Email verification is not required to sign in. The verify link from signup
  // still works and still stamps user.emailVerified, it just no longer gates
  // login.
  const token = await createUserSessionToken(user.id, user.email);
  await setUserSessionCookie(token);
  redirect("/account");
}
