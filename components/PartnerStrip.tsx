export type PartnerView = { name: string; logoUrl: string | null };

// Used when the admin hasn't added any partners yet.
const defaultPartners: PartnerView[] = [
  { name: "Mandiri Sekuritas", logoUrl: null },
  { name: "BNI Sekuritas", logoUrl: null },
  { name: "CGS CIMB", logoUrl: null },
  { name: "Trimegah", logoUrl: null },
  { name: "Mirae Asset", logoUrl: null },
  { name: "ajaib", logoUrl: null },
  { name: "IDX", logoUrl: null },
];

export default function PartnerStrip({
  partners: partnersProp,
}: {
  partners?: PartnerView[];
}) {
  const partners =
    partnersProp && partnersProp.length > 0 ? partnersProp : defaultPartners;

  return (
    <section className="border-t border-slate-200 bg-white py-12">
      <div className="container-page">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
          Our Partners &amp; Collaborations
        </p>
        <div className="mt-8 grid grid-cols-2 items-center gap-6 sm:grid-cols-4 lg:grid-cols-7">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex h-16 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 px-3 text-center text-sm font-semibold text-slate-400 grayscale transition hover:text-primary hover:grayscale-0"
            >
              {partner.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={partner.logoUrl}
                  alt={partner.name}
                  className="max-h-12 max-w-full object-contain"
                />
              ) : (
                partner.name
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
