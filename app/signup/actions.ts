"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createUserSessionToken,
  hashPassword,
  setUserSessionCookie,
} from "@/lib/userAuth";

export interface AuthState {
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signupUser(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = (formData.get("name") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
  const password = (formData.get("password") as string) ?? "";
  const confirm = (formData.get("confirm") as string) ?? "";

  if (!name) return { error: "Please enter your full name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email." };
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) return { error: "Passwords do not match." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  // No email confirmation step: the address is taken as given and the account
  // is usable straight away.
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      emailVerified: new Date(),
    },
  });

  const token = await createUserSessionToken(user.id, user.email);
  await setUserSessionCookie(token);
  redirect("/account");
}
