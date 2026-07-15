"use server";

import { redirect } from "next/navigation";
import { clearUserSessionCookie } from "@/lib/userAuth";

export async function logoutUser() {
  await clearUserSessionCookie();
  redirect("/login");
}
