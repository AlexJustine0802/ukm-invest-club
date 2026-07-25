"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/userAuth";
import { consumeAuthToken } from "@/lib/authTokens";

export interface ResetState {
  error?: string;
}

export async function resetPassword(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const token = (formData.get("token") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const confirm = (formData.get("confirm") as string) ?? "";

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) return { error: "Passwords do not match." };

  const userId = await consumeAuthToken(token, "RESET");
  if (!userId) {
    return { error: "This reset link is invalid or has expired." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(password),
      // Completing a reset proves the address is reachable.
      emailVerified: new Date(),
    },
  });

  redirect("/login?reset=1");
}
