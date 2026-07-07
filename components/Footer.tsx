import Link from "next/link";
import { site } from "@/lib/site";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="mt-20 bg-navy-dark text-slate-300">
      <div className="container-page grid gap-8 py-12 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Investment Club Unpar"
              width={180}
              height={60}
              className="h-20 w-auto"
            />
          </div>
          <p className="mt-3 max-w-xs text-sm text-slate-400">
            {site.description}
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
            Explore
          </h3>
          <ul className="space-y-2 text-sm">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-slate-400 transition-colors hover:text-primary-light"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
            Connect
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href={`mailto:${site.email}`}
                className="text-slate-400 transition-colors hover:text-primary-light"
              >
                {site.email}
              </a>
            </li>
            <li>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 transition-colors hover:text-primary-light"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 transition-colors hover:text-primary-light"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.fullName}. All rights reserved.
          </p>
          <Link href="/admin" className="hover:text-primary-light">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
