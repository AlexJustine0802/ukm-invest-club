import Reveal from "@/components/Reveal";
import {
  PARTNER_CATEGORIES,
  toPartnerCategory,
  type PartnerCategory,
} from "@/lib/partners";

export type PartnerView = {
  name: string;
  logoUrl: string | null;
  category?: string | null;
};

// Used when the admin hasn't added any partners yet. Split across both groups
// so an empty database still demonstrates what each section is for.
const defaultPartners: PartnerView[] = [
  { name: "Mandiri Sekuritas", logoUrl: null, category: "COMPANY" },
  { name: "BNI Sekuritas", logoUrl: null, category: "COMPANY" },
  { name: "CGS CIMB", logoUrl: null, category: "COMPANY" },
  { name: "Trimegah", logoUrl: null, category: "COMPANY" },
  { name: "Mirae Asset", logoUrl: null, category: "COMPANY" },
  { name: "ajaib", logoUrl: null, category: "COMPANY" },
  { name: "IDX", logoUrl: null, category: "COMPANY" },
  { name: "Investor Community", logoUrl: null, category: "COMMUNITY_MEDIA" },
  { name: "Campus Media", logoUrl: null, category: "COMMUNITY_MEDIA" },
  { name: "Finance Daily", logoUrl: null, category: "COMMUNITY_MEDIA" },
];

function PartnerLogo({ partner }: { partner: PartnerView }) {
  return (
    <div className="flex h-16 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 px-3 text-center text-sm font-semibold text-slate-400 grayscale transition hover:text-primary hover:grayscale-0">
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
  );
}

function PartnerGroup({
  label,
  blurb,
  partners,
}: {
  label: string;
  blurb: string;
  partners: PartnerView[];
}) {
  return (
    <div>
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      {/* The grid keeps its height when a group is empty, so the two sections
          stay the same shape whether or not anyone has been added yet. */}
      <div className="mt-8 grid min-h-[64px] grid-cols-2 items-center gap-6 sm:grid-cols-4 lg:grid-cols-7">
        {partners.length > 0 ? (
          partners.map((partner) => (
            <PartnerLogo key={partner.name} partner={partner} />
          ))
        ) : (
          <p className="col-span-full text-center text-sm text-slate-400">
            {blurb}
          </p>
        )}
      </div>
    </div>
  );
}

export default function PartnerStrip({
  partners: partnersProp,
}: {
  partners?: PartnerView[];
}) {
  const partners =
    partnersProp && partnersProp.length > 0 ? partnersProp : defaultPartners;

  const grouped = PARTNER_CATEGORIES.map((c) => ({
    ...c,
    items: partners.filter(
      (p) => toPartnerCategory(p.category) === (c.value as PartnerCategory),
    ),
  }));

  return (
    <>
      {grouped.map((group) => (
        <Reveal
          key={group.value}
          as="section"
          className="border-t border-slate-200 bg-white py-12"
        >
          <div className="container-page">
            <PartnerGroup
              label={group.label}
              blurb={group.blurb}
              partners={group.items}
            />
          </div>
        </Reveal>
      ))}
    </>
  );
}
