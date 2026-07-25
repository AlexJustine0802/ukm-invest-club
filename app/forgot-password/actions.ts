"use server";

import { prisma } from "@/lib/prisma";
import { issueAuthToken, siteUrl } from "@/lib/authTokens";
import { sendAuthEmail } from "@/lib/email";

export interface ForgotState {
  error?: string;
  sent?: boolean;
}

export async function requestPasswordReset(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase() ?? "";
  if (!email) return { error: "Please enter your email." };

  const user = await prisma.user.findUnique({ where: { email } });

  // Only send when the account exists, but always report the same result so
  // this endpoint cannot be used to discover which emails are registered.
  if (user) {
    const token = await issueAuthToken(user.id, "RESET");
    await sendAuthEmail(
      user.email,
      "reset",
      `${siteUrl()}/reset-password?token=${token}`,
    );
  }

  return { sent: true };
}
