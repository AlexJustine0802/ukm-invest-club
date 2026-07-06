// ponytail: text wordmarks stand in for real logo images; swap for <Image> when assets land.
const partners = [
  "Mandiri Sekuritas",
  "BNI Sekuritas",
  "CGS CIMB",
  "Trimegah",
  "Mirae Asset",
  "ajaib",
  "IDX",
];

export default function PartnerStrip() {
  return (
    <section className="border-t border-slate-200 bg-white py-12">
      <div className="container-page">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
          Our Partners &amp; Collaborations
        </p>
        <div className="mt-8 grid grid-cols-2 items-center gap-6 sm:grid-cols-4 lg:grid-cols-7">
          {partners.map((name) => (
            <div
              key={name}
              className="flex h-16 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 px-3 text-center text-sm font-semibold text-slate-400 grayscale transition hover:text-primary hover:grayscale-0"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
