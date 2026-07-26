"use client";

import { useFormStatus } from "react-dom";
import Spinner from "@/components/Spinner";

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
      {pending && <Spinner />}
      {pending ? pendingLabel : label}
    </button>
  );
}
