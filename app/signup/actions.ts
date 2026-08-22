"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/userAuth";
import { issueAuthToken, siteUrl } from "@/lib/authTokens";
import { sendAuthEmail } from "@/lib/email";

export interface AuthState {
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Deliberately loose: digits with the separators people actually type, and an
// optional country code. Tightening this further only rejects valid numbers.
const PHONE_RE = /^\+?[\d(][\d\s().-]{7,19}$/;

export async function signupUser(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = (formData.get("name") as string)?.trim() ?? "";
  const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
  const phone = (formData.get("phone") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";
  const confirm = (formData.get("confirm") as string) ?? "";

  if (!name) return { error: "Please enter your full name." };
  if (!EMAIL_RE.test(email)) return { error: "Please enter a valid email." };
  if (!PHONE_RE.test(phone)) {
    return { error: "Please enter a valid phone number." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) return { error: "Passwords do not match." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
    },
  });

  try {
    const verifyToken = await issueAuthToken(user.id, "VERIFY");
    await sendAuthEmail(
      user.email,
      "verify",
      `${siteUrl()}/verify-email?token=${verifyToken}`,
    );
  } catch (error) {
    await prisma.user.delete({ where: { id: user.id } });
    console.error("Unable to send signup verification email.", error);
    return {
      error:
        "We could not send the verification email. Check the email setup and try again.",
    };
  }

  // No auto-login: signing up and signing in stay separate steps, so the new
  // member enters their credentials once before reaching the dashboard.
  redirect("/verify-email?pending=1");
}
