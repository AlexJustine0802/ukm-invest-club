import Link from "next/link";
import { site } from "@/lib/site";
import LoginForm from "@/components/admin/LoginForm";

export const metadata = { title: "Admin Login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold font-bold text-navy">
              IC
            </span>
            <span className="text-xl font-bold">{site.name}</span>
          </Link>
          <p className="mt-2 text-sm text-slate-400">Admin Dashboard</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="text-xl font-bold text-navy">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your admin credentials to manage the site.
          </p>
          <div className="mt-6">
            <LoginForm from={from ?? "/admin"} />
          </div>
        </div>

        <p className="mt-4 text-center text-sm text-slate-400">
          <Link href="/" className="hover:text-gold">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
