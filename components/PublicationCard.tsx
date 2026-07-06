import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface PublicationCardProps {
  publication: {
    slug: string;
    title: string;
    excerpt: string;
    coverImage: string | null;
    author: string | null;
    publishedAt: Date;
  };
}

export default function PublicationCard({ publication }: PublicationCardProps) {
  return (
    <Link
      href={`/publications/${publication.slug}`}
      className="card group flex flex-col"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
        {publication.coverImage ? (
          <Image
            src={publication.coverImage}
            alt={publication.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <span className="text-4xl">📄</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm font-medium text-primary">
          {formatDate(publication.publishedAt)}
        </p>
        <h3 className="mt-1 text-lg font-bold text-navy group-hover:text-primary">
          {publication.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-600">
          {publication.excerpt}
        </p>
        {publication.author && (
          <p className="mt-3 text-xs text-slate-400">By {publication.author}</p>
        )}
      </div>
    </Link>
  );
}
