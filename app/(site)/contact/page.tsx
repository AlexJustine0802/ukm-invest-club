import type { Metadata } from "next";
import { site } from "@/lib/site";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${site.name}.`,
};

export default function ContactPage() {
  return (
    <div>
      <PageHeader
        title="Contact us"
        subtitle="Have a question, partnership idea, or want to join? Send us a message."
      />
      <div className="container-page grid gap-12 py-12 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-navy">Let&apos;s talk</h2>
          <p className="mt-3 text-slate-600">
            Fill out the form and our team will get back to you. You can also
            reach us directly through the channels below.
          </p>

          <dl className="mt-8 space-y-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✉️</span>
              <div>
                <dt className="text-sm font-semibold text-navy">Email</dt>
                <dd>
                  <a
                    href={`mailto:${site.email}`}
                    className="text-slate-600 hover:text-primary"
                  >
                    {site.email}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📸</span>
              <div>
                <dt className="text-sm font-semibold text-navy">Instagram</dt>
                <dd>
                  <a
                    href={site.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-600 hover:text-primary"
                  >
                    Follow us
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <dt className="text-sm font-semibold text-navy">Campus</dt>
                <dd className="text-slate-600">Universitas Parahyangan, Bandung</dd>
              </div>
            </div>
          </dl>
        </div>

        <div className="card p-6 sm:p-8">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
