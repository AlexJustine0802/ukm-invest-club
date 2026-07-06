"use client";

interface DeleteButtonProps {
  action: (formData: FormData) => void;
  id: string;
  label?: string;
  className?: string;
  confirmMessage?: string;
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
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
