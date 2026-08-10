import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/site";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    // suppressHydrationWarning: the inline script below adds `dark` to this
    // element before React hydrates, so the client class list is meant to
    // differ from the server's. It suppresses the warning on this element only.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
    >
      <head>
        {/* Applies the saved theme before first paint. In <head> and
            synchronous on purpose: run any later and the page paints light for
            a frame before flipping to dark. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.theme==='dark')document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
        {/* Scroll-reveal starts sections at opacity 0 and animates them in with
            JavaScript. With scripting off that never happens, so the whole page
            would read as blank  this puts every revealed section back. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
