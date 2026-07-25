import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DiscussionChannelForm from "@/components/admin/DiscussionChannelForm";
import { updateChannel } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditChannelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const channel = await prisma.discussionChannel.findUnique({ where: { id } });
  if (!channel) notFound();

  return (
    <div>
      <Link href="/admin/discussions" className="text-sm text-accent-dark hover:text-accent">
        ← Back to channels
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Edit channel</h1>
      <div className="mt-6 max-w-2xl">
        <DiscussionChannelForm action={updateChannel} channel={channel} />
      </div>
    </div>
  );
}
