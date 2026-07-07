import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: `${site.name} - ${site.fullName}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
