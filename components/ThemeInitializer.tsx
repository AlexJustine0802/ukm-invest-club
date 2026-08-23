"use client";

import { useEffect } from "react";

/**
 * Applies the saved member theme without rendering an inline script.
 * React 19/Next 16 reports inline scripts rendered through components as
 * client-rendered scripts, even when they are intended to run before hydrate.
 */
export default function ThemeInitializer() {
  useEffect(() => {
    try {
      const isMemberPage = window.location.pathname.startsWith("/account");
      const useDarkTheme = isMemberPage && localStorage.getItem("theme") === "dark";
      document.documentElement.classList.toggle("dark", useDarkTheme);
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
  }, []);

  return null;
}
