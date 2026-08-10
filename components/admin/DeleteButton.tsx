"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useFormStatus } from "react-dom";
import { AlertTriangle } from "lucide-react";
import Spinner from "@/components/Spinner";

interface DeleteButtonProps {
  action: (formData: FormData) => void;
  id: string;
  label?: string;
  className?: string;
  confirmMessage?: string;
}

/**
 * Separate component because useFormStatus only reports the status of a form
 * above it in the tree  called in the same component that renders <form>, it
 * always returns false.
 */
function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-danger flex-1" disabled={pending}>
      {/* Deleting is a round trip to the database. Without this the button
          looks inert for a second or more, people click again, and the second
          submit hits an already-deleted row (Prisma P2025). */}
      {pending && <Spinner />}
      {pending ? "Deleting…" : label}
    </button>
  );
}

/** Cancel has to know about `pending` too, or it can dismiss a live request. */
function Cancel({ onClick }: { onClick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="btn-secondary flex-1"
    >
      Cancel
    </button>
  );
}

export default function DeleteButton({
  action,
  id,
  label = "Delete",
  className = "btn-danger",
  confirmMessage = "Are you sure you want to delete this? This cannot be undone.",
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  // Portals need the document, which does not exist during the server render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    // The page behind a modal should not scroll under it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const dialog = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop. Clicking it cancels, same as the Cancel button. */}
      <button
        type="button"
        aria-label="Cancel"
        onClick={() => setOpen(false)}
        className="absolute inset-0 h-full w-full cursor-default bg-navy-dark/60"
      />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <AlertTriangle className="h-6 w-6" />
        </span>
        <h2
          id="delete-dialog-title"
          className="mt-4 text-lg font-bold text-navy"
        >
          Delete this?
        </h2>
        <p className="mt-1 text-sm text-slate-500">{confirmMessage}</p>

        <form action={action} className="mt-6 flex gap-3">
          <input type="hidden" name="id" value={id} />
          {/* Delete first, matching the order asked for. Cancel keeps the
              quieter style so the destructive one is never the easy miss. */}
          <Submit label={label} />
          <Cancel onClick={() => setOpen(false)} />
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>
      {/* Rendered into <body>: the page wrapper animates a transform, and a
          transformed ancestor makes `position: fixed` resolve against it
          instead of the viewport, which would put this modal off-centre. */}
      {open && mounted && createPortal(dialog, document.body)}
    </>
  );
}
