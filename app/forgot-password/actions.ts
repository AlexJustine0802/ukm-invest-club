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
    try {
      const token = await issueAuthToken(user.id, "RESET");
      await sendAuthEmail(
        user.email,
        "reset",
        `${siteUrl()}/reset-password?token=${token}`,
      );
    } catch (error) {
      // Do not leave a usable reset token behind when delivery failed. The
      // member can safely request another one after the mail configuration is
      // fixed.
      try {
        await prisma.authToken.deleteMany({
          where: { userId: user.id, type: "RESET" },
        });
      } catch (cleanupError) {
        console.error("[auth] Failed to clean up reset token", cleanupError);
      }
      console.error("[auth] Password reset email failed", error);
      return {
        error: "We could not send the reset email. Please try again later.",
      };
    }
  }

  return { sent: true };
}
