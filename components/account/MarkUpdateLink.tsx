"use client";

import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent, ReactNode } from "react";
import { markUpdateRead } from "@/app/account/actions";

/** A link that records the clicked update before navigating to its content. */
export default function MarkUpdateLink({
  notificationKey,
  href,
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, "href" | "children" | "onClick"> & {
  href: LinkProps["href"];
  notificationKey: string;
  children: ReactNode;
}) {
  const router = useRouter();

  const onClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    try {
      await markUpdateRead(notificationKey);
    } finally {
      router.push(typeof href === "string" ? href : href.toString());
    }
  };

  return (
    <Link href={href} onClick={onClick} {...props}>
      {children}
    </Link>
  );
}
