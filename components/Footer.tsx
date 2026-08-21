import Link from "next/link";
import { site } from "@/lib/site";
import Image from "next/image";
import Reveal from "@/components/Reveal";

export default function Footer() {
  return (
    <Reveal as="footer" className="mt-20 bg-navy-dark text-slate-300">
      <div className="container-page grid items-start gap-10 py-10 md:grid-cols-[1.45fr_0.8fr_0.8fr] lg:gap-16">
        <div className="max-w-sm">
          <div className="relative h-14 w-52 overflow-hidden">
            <Image
              src="/images/pfcspace_logo.png"
              alt="Investment Club Unpar"
              fill
              sizes="160px"
              className="object-cover object-[center_40%]"
            />
          </div>
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
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
    </Reveal>
  );
}
