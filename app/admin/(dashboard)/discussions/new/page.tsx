import Link from "next/link";
import DiscussionChannelForm from "@/components/admin/DiscussionChannelForm";
import { createChannel } from "../actions";

export default function NewChannelPage() {
  return (
    <div>
      <Link href="/admin/discussions" className="text-sm text-accent-dark hover:text-accent">
        ← Back to channels
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-navy">Add channel</h1>
      <div className="mt-6 max-w-2xl">
        <DiscussionChannelForm action={createChannel} />
      </div>
    </div>
  );
}
