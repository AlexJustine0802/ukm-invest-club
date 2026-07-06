"use server";

import { redirect } from "next/navigation";
import {
  adminCredentialsConfigured,
  createSessionToken,
  setSessionCookie,
  verifyAdminCredentials,
} from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const username = (formData.get("username") as string)?.trim() ?? "";
  const password = (formData.get("password") as string) ?? "";
  const from = (formData.get("from") as string) || "/admin";

  if (!adminCredentialsConfigured()) {
    return {
      error:
        "Admin credentials are not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD_HASH.",
    };
  }

  const ok = await verifyAdminCredentials(username, password);
  if (!ok) {
    return { error: "Invalid username or password." };
  }

  const token = await createSessionToken(username);
  await setSessionCookie(token);

  // Only allow same-site relative redirects.
  const target = from.startsWith("/admin") ? from : "/admin";
  redirect(target);
}
