import Image from "next/image";

/**
 * A company's logo, or its initial when there isn't one.
 *
 * Postings come from wherever the admin found them, so a logo is often
 * missing. The fallback keeps the same square as the image, which is what
 * stops a grid of cards from going ragged.
 */
export default function CompanyLogo({
  logo,
  company,
  className = "h-11 w-11",
  fallbackClassName = "bg-blue-50 text-primary",
}: {
  logo: string | null;
  company: string;
  className?: string;
  fallbackClassName?: string;
}) {
  if (logo) {
    return (
      <span
        className={`relative shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`}
      >
        <Image
          src={logo}
          alt={company}
          fill
          // contain, not cover: a logo cropped to fill the square stops being
          // the logo.
          className="object-contain p-1.5"
          sizes="64px"
        />
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl text-lg font-bold ${fallbackClassName} ${className}`}
    >
      {company.charAt(0).toUpperCase()}
    </span>
  );
}
