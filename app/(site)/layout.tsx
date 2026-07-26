import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
