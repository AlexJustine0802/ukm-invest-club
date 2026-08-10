import Reveal from "@/components/Reveal";
import { Marquee } from "@/components/ui/marquee";
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

function PartnerLogo({ partner }: { partner: PartnerView }) {
  return (
    // Fixed width and shrink-0: inside the marquee the row is `w-max`, so a
    // flexible card would collapse to its text and break the loop's spacing.
    <div className="mx-3 flex h-16 w-44 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 px-3 text-center text-sm font-semibold text-slate-400 grayscale transition hover:text-primary hover:grayscale-0">
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
  direction,
}: {
  label: string;
  blurb: string;
  partners: PartnerView[];
  /** The two groups travel opposite ways, so the strip does not read as one belt. */
  direction: "left" | "right";
}) {
  // A short list leaves a visible gap: one copy of three cards is narrower than
  // the strip, so the track has to be padded out before the marquee doubles it.
  const loopItems: PartnerView[] = [];
  while (partners.length > 0 && loopItems.length < 8) {
    loopItems.push(...partners);
  }

  return (
    <div>
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </p>
      {/* Same min height whether or not anyone has been added yet, so an empty
          database renders the section at the shape it will keep. */}
      <div className="mt-4 flex min-h-[104px] items-center">
        {partners.length > 0 ? (
          <Marquee
            direction={direction}
            speed={loopItems.length * 6}
            pauseOnHover
            // Masked edges: the loop seam is what gives a marquee away, and
            // fading both ends hides where the second copy starts.
            className="[mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
          >
            {loopItems.map((partner, index) => (
              <PartnerLogo key={`${partner.name}-${index}`} partner={partner} />
            ))}
          </Marquee>
        ) : (
          <p className="w-full text-center text-sm text-slate-400">{blurb}</p>
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
  // No hardcoded fallback: the public page must show exactly what is in
  // /admin/partners, so an empty table reads as empty rather than inventing
  // partners nobody can edit or remove.
  const partners = partnersProp ?? [];

  const grouped = PARTNER_CATEGORIES.map((c, index) => ({
    direction: (index % 2 === 0 ? "left" : "right") as "left" | "right",
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
              direction={group.direction}
            />
          </div>
        </Reveal>
      ))}
    </>
  );
}
