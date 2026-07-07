import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Camera,
  Clock,
  Mail,
  MapPin,
  Phone,
  Users,
  Video,
} from "lucide-react";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Investment Club Unpar.",
};

const contactCards = [
  {
    title: "Our Location",
    icon: MapPin,
    lines: ["Jl. Ciumbuleuit No. 94", "Bandung, Indonesia", "40141"],
    action: "View on Map",
    href: "https://maps.google.com/?q=Jl.+Ciumbuleuit+No.+94+Bandung",
  },
  {
    title: "Email Us",
    icon: Mail,
    lines: ["info@investmentclubunpar.com", "We'll respond within", "1-2 business days."],
    href: "mailto:info@investmentclubunpar.com",
  },
  {
    title: "Call Us",
    icon: Phone,
    lines: ["+62 812 3456 7890", "Mon - Fri, 09.00 - 17.00 WIB"],
    href: "tel:+6281234567890",
  },
  {
    title: "Office Hours",
    icon: Clock,
    lines: ["Monday - Friday", "09.00 - 17.00 WIB", "Saturday - Sunday", "Closed"],
  },
];

const socialLinks = [
  {
    title: "@icu.unpar",
    label: "Instagram",
    icon: Camera,
    href: "https://instagram.com/",
  },
  {
    title: "Investment Club Unpar",
    label: "LinkedIn",
    icon: BriefcaseBusiness,
    href: "https://linkedin.com/",
  },
  {
    title: "ICU Unpar",
    label: "YouTube",
    icon: Video,
    href: "https://youtube.com/",
  },
  {
    title: "info@investmentclubunpar.com",
    label: "Email",
    icon: Mail,
    href: "mailto:info@investmentclubunpar.com",
  },
];

export default function ContactPage() {
  return (
    <div className="bg-white text-navy">
      <section className="relative overflow-hidden border-b border-blue-50 bg-white">
        <div className="absolute -left-12 top-8 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,transparent_0_42%,#dbeafe_43%,transparent_44%),radial-gradient(circle_at_center,#93b4ff_1.3px,transparent_1.3px)] opacity-80 [background-size:100%_100%,8px_8px]" />
        <div className="absolute right-12 top-16 h-40 w-48 bg-[radial-gradient(circle_at_center,#93b4ff_1.5px,transparent_1.5px)] opacity-55 [background-size:24px_24px]" />
        <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,transparent_0_39%,#dbeafe_40%,transparent_41%),repeating-linear-gradient(135deg,rgba(20,77,200,0.12)_0_2px,transparent_2px_9px)] opacity-80" />
        <div className="absolute bottom-10 left-0 h-28 w-36 bg-[radial-gradient(circle_at_center,#93b4ff_1.4px,transparent_1.4px)] opacity-55 [background-size:24px_24px]" />

        <div className="container-page relative flex min-h-[460px] flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-bold uppercase text-primary">
            Let&apos;s Connect
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-navy sm:text-5xl lg:text-6xl">
            We&apos;d Love to
            <br />
            Hear from <span className="text-primary">You!</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
            Have a question, collaboration idea, or want to learn more about
            our community? Feel free to reach out to us.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="#send-message" className="btn-primary">
              <Mail className="mr-2 h-5 w-5" />
              Send Message
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/contact#send-message" className="btn-secondary">
              <Users className="mr-2 h-5 w-5" />
              Join Our Community
            </Link>
          </div>
        </div>
      </section>

      <section className="container-page py-10">
        <h2 className="text-lg font-bold uppercase text-navy">Get in Touch</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((card) => (
            <article
              key={card.title}
              className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm"
            >
              <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-light text-primary">
                <card.icon className="h-11 w-11" />
              </span>
              <h3 className="mt-7 text-lg font-bold text-navy">{card.title}</h3>
              <div className="mt-5 space-y-2 text-base font-medium leading-7 text-slate-700">
                {card.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              {card.action && card.href && (
                <Link
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark"
                >
                  {card.action}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="container-page pb-8">
        <h2 className="text-lg font-bold uppercase text-navy">Follow Us</h2>
        <div className="mt-5 grid overflow-hidden rounded-lg border border-slate-200 bg-blue-50/45 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
          {socialLinks.map((social, index) => (
            <Link
              key={social.title}
              href={social.href}
              target={social.href.startsWith("http") ? "_blank" : undefined}
              rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className={`flex items-center gap-4 p-7 transition-colors hover:bg-white ${
                index > 0 ? "lg:border-l lg:border-slate-200" : ""
              } ${index % 2 === 1 ? "sm:border-l sm:border-slate-200 lg:border-l" : ""}`}
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                <social.icon className="h-8 w-8" />
              </span>
              <span>
                <span className="block font-bold text-navy">{social.title}</span>
                <span className="mt-1 block text-sm font-medium text-slate-500">
                  {social.label}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="send-message" className="container-page pb-10">
        <h2 className="text-lg font-bold uppercase text-navy">
          Send Us a Message
        </h2>
        <div className="mt-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <ContactForm />
        </div>
      </section>

      <section className="container-page pb-10">
        <div className="relative overflow-hidden rounded-lg bg-navy-dark p-7 text-white shadow-lg">
          <div className="absolute right-0 top-0 h-full w-44 bg-[radial-gradient(circle_at_center,#93b4ff_1.4px,transparent_1.4px)] opacity-75 [background-size:20px_20px]" />
          <div className="relative grid items-center gap-6 lg:grid-cols-[auto_1fr_auto]">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light/20 text-white">
              <Mail className="h-9 w-9" />
            </span>
            <div>
              <h2 className="text-2xl font-bold">Stay Connected with ICU</h2>
              <p className="mt-2 text-sm text-blue-100">
                Subscribe to our newsletter and never miss an update!
              </p>
            </div>
            <form className="flex w-full flex-col gap-3 sm:flex-row lg:w-[480px]">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                className="min-h-12 flex-1 rounded-md border border-white/30 bg-white/10 px-4 text-sm text-white outline-none placeholder:text-blue-100 focus:border-white/60"
              />
              <button type="submit" className="btn-primary min-h-12 px-8">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
