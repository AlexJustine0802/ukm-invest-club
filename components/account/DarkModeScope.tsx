"use client";

import { useEffect } from "react";

/**
 * Dark mode is a member-area setting only. The inline script in the root layout
 * applies it before paint on a fresh /account load; this handles the two cases
 * the script cannot see  a client-side navigation *into* the member area, and
 * leaving it (logout, a link to the public site), where the class has to come
 * back off so the login page and public pages stay light.
 */
export default function DarkModeScope() {
  useEffect(() => {
    const root = document.documentElement;
    if (localStorage.theme === "dark") root.classList.add("dark");
    return () => root.classList.remove("dark");
  }, []);

  return null;
}
