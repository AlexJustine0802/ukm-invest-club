import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Create Account" };

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg sm:p-10">
        <Link href="/" className="mx-auto mb-6 flex justify-center">
          <Image
            src="/images/logo-nobg.png"
            alt={`${site.name} logo`}
            width={260}
            height={104}
            priority
            className="h-20 w-auto object-contain"
          />
        </Link>
        <h1 className="text-center text-3xl font-extrabold text-navy">
          Create Your Account
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm text-slate-500">
          Join {site.fullName} and start your journey to learn, invest, and make
          an impact.
        </p>
        <div className="mt-8">
          <SignupForm />
        </div>
      </div>
    </main>
  );
}
