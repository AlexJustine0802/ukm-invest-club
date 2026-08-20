import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg sm:p-10">
        <Link href="/" className="mx-auto mb-6 flex justify-center">
          <Image
            src="/images/logo_new_notxt.png"
            alt={`${site.name} logo`}
            width={260}
            height={104}
            priority
            className="h-20 w-auto object-contain"
          />
        </Link>
        <h1 className="text-center text-3xl font-extrabold text-navy">{title}</h1>
        {subtitle && (
          <p className="mx-auto mt-2 max-w-xs text-center text-sm text-slate-500">
            {subtitle}
          </p>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
