"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markNotificationsRead } from "@/app/account/actions";

/**
 * Marks notification keys read once the member has actually looked at them.
 *
 * Rendered by a page that has just shown the member a set of rows  opening the
 * "Due Soon" tab is as good as reading the bell notification for what is in it,
 * so both counts clear from the one write.
 *
 * The write cannot happen while the page renders on the server: a GET must not
 * mutate, and revalidating mid-render would loop. Doing it from an effect after
 * paint keeps the render pure.
 */
export default function MarkSeen({ keys }: { keys: string[] }) {
  const router = useRouter();
  // Effects re-run in dev StrictMode and after the refresh below; without this
  // the same keys would be posted repeatedly.
  const done = useRef<string>("");

  useEffect(() => {
    const signature = [...keys].sort().join(",");
    if (!signature || done.current === signature) return;
    done.current = signature;

    void markNotificationsRead(keys).then(() => router.refresh());
  }, [keys, router]);

  return null;
}
