"use client";

import { useState } from "react";
import { SmoothCursor } from "@/components/ui/smooth-cursor";

/**
 * Confines SmoothCursor to one section.
 *
 * The component itself is global: it listens on `window` and sets
 * `body { cursor: none }` for as long as it is mounted. Mounting it only while
 * the pointer is inside this box is what keeps the effect — and the hidden
 * native cursor — from leaking into the rest of the page, since its own effect
 * cleanup restores the cursor on unmount.
 */
export default function HeroCursorArea({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [inside, setInside] = useState(false);

  return (
    <div
      className={className}
      // Touch pointers fire enter on tap and never leave; SmoothCursor already
      // disables itself there, but there is no reason to mount it either.
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") setInside(true);
      }}
      onPointerLeave={() => setInside(false)}
    >
      {children}
      {inside && <SmoothCursor />}
    </div>
  );
}
