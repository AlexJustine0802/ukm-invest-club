import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import LoginForm from "@/components/auth/LoginForm";
import SignupCelebration from "@/components/auth/SignupCelebration";

export const metadata: Metadata = { title: "Log In" };

export default function LoginPage() {
  return (
    // min-h-dvh, not min-h-screen: on mobile browsers `100vh` is the height
    // with the URL bar hidden, which is taller than what you can actually see
    // and puts the card just past the fold.
    <main className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <Link href="/" className="mx-auto mb-4 flex justify-center">
          <Image
            src="/images/logo-nobg.png"
            alt={`${site.name} logo`}
            width={260}
            height={104}
            priority
            className="h-16 w-auto object-contain"
          />
        </Link>
        <h1 className="text-center text-2xl font-extrabold text-navy sm:text-3xl">
          Welcome Back!
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-center text-sm text-slate-500">
          Log in to access resources, connect with members, and grow together.
        </p>
        <div className="mt-6">
          <Suspense>
            <SignupCelebration />
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
