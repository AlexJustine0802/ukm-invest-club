"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  label = "Save",
  pendingLabel = "Saving…",
}: {
  label?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary" disabled={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}
