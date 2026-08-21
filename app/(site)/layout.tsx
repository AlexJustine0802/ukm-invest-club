import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { getUserSession } from "@/lib/userAuth";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Signed-in members clicking the logo expect their dashboard, not the
  // public home page. Reading the session here makes the public shell
  // dynamically rendered.
  const session = await getUserSession();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar homeHref={session ? "/account" : "/"} />
      {/* The wrapper sits below the navbar on purpose: animating a transform
          on an ancestor would break the navbar's sticky positioning. */}
      <main className="min-w-0 flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}
