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

/**
 * Card tints, picked by name so a partner keeps the same colour on every
 * render and between the two sections — a strip that reshuffles its colours on
 * each load reads as a bug.
 */
const TINTS = [
  "from-blue-50 to-white ring-blue-100 hover:ring-primary/40",
  "from-emerald-50 to-white ring-emerald-100 hover:ring-emerald-400/50",
  "from-violet-50 to-white ring-violet-100 hover:ring-violet-400/50",
  "from-amber-50 to-white ring-amber-100 hover:ring-amber-400/50",
  "from-rose-50 to-white ring-rose-100 hover:ring-rose-400/50",
  "from-sky-50 to-white ring-sky-100 hover:ring-sky-400/50",
];

const TEXT_TINTS = [
  "text-primary",
  "text-emerald-700",
  "text-violet-700",
  "text-amber-700",
  "text-rose-700",
  "text-sky-700",
];

function tintIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(hash) % TINTS.length;
}

function PartnerLogo({ partner }: { partner: PartnerView }) {
  const i = tintIndex(partner.name);

  return (
    <div
      className={`flex h-20 w-36 items-center justify-center rounded-xl bg-gradient-to-b px-3 text-center text-sm font-bold ring-1 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${TINTS[i]} ${TEXT_TINTS[i]}`}
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
      <div className="flex flex-col items-center">
        <p className="bg-gradient-to-r from-primary via-accent to-primary-dark bg-clip-text text-sm font-extrabold uppercase tracking-widest text-transparent">
          {label}
        </p>
        <span className="mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-accent" />
      </div>

      {/* Wrapping and centred rather than a fixed grid: one partner sits in the
          middle instead of stranded in the first cell of a seven-wide row. The
          min height keeps both sections the same shape when one is empty. */}
      <div className="mt-8 flex min-h-[80px] flex-wrap items-center justify-center gap-4">
        {partners.length > 0 ? (
          partners.map((partner) => (
            <PartnerLogo key={partner.name} partner={partner} />
          ))
        ) : (
          <p className="text-center text-sm text-slate-500">{blurb}</p>
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
      {grouped.map((group, i) => (
        <Reveal
          key={group.value}
          as="section"
          // Alternating washes so the two groups read as two sections without
          // a hard rule between them.
          className={`py-14 ${
            i % 2 === 0
              ? "bg-gradient-to-b from-white to-blue-50/60"
              : "bg-gradient-to-b from-blue-50/60 to-white"
          }`}
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
