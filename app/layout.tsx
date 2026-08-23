import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site";
import ThemeInitializer from "@/components/ThemeInitializer";

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
    // globals.css sets scroll-behavior: smooth. This attribute is how Next is
    // told about it, so the router can suspend smooth scrolling during a route
    // change  without it, scroll restoration animates instead of jumping.
    // suppressHydrationWarning: the client theme initializer can add `dark`
    // after the server render, so the class list may differ during hydration.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className="font-sans"
    >
      <head>
        {/* Scroll-reveal starts sections at opacity 0 and animates them in with
            JavaScript. With scripting off that never happens, so the whole page
            would read as blank  this puts every revealed section back. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="antialiased">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
