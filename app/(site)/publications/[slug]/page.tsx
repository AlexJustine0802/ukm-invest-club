import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Markdown from "@/components/Markdown";
import { TextAnimate } from "@/components/ui/text-animate";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getPublication(slug: string) {
  return prisma.publication.findFirst({ where: { slug, published: true } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pub = await getPublication(slug);
  if (!pub) return { title: "Publication not found" };
  return { title: pub.title, description: pub.excerpt };
}

export default async function PublicationDetailPage({ params }: Props) {
  const { slug } = await params;
  const pub = await getPublication(slug);
  if (!pub) notFound();

  return (
    <article className="container-page py-12">
      <Link
        href="/publications"
        className="text-sm font-medium text-primary hover:text-primary-dark"
      >
        ← Back to publications
      </Link>

      <div className="mx-auto mt-6 max-w-3xl">
        <p className="text-sm font-medium text-primary">
          {formatDate(pub.publishedAt)}
          {pub.author && ` · ${pub.author}`}
        </p>
        <TextAnimate
          as="h1"
          animation="blurInUp"
          by="character"
          once
          className="mt-2 text-4xl font-extrabold text-navy"
        >
          {pub.title}
        </TextAnimate>
        <TextAnimate
          as="p"
          animation="blurInUp"
          by="word"
          once
          className="mt-3 text-lg text-slate-600"
        >
          {pub.excerpt}
        </TextAnimate>

        {pub.coverImage && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
            <Image
              src={pub.coverImage}
              alt={pub.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <div className="mt-8">
          <Markdown content={pub.content} />
        </div>
      </div>
    </article>
  );
}
