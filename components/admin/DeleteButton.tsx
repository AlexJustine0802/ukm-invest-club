"use client";

import { useFormStatus } from "react-dom";
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
function Submit({ label, className }: { label: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {/* Deleting is a round trip to the database. Without this the button
          looks inert for a second or more, people click again, and the second
          submit hits an already-deleted row (Prisma P2025). */}
      {pending && <Spinner />}
      {pending ? "Deleting…" : label}
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
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Submit label={label} className={className} />
    </form>
  );
}
