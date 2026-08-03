"use client";

import { useState, useTransition } from "react";

export interface CategoryOption {
  /** What the form submits: a title for folders, a row id for events. */
  value: string;
  label: string;
}

interface CategorySelectProps {
  name: string;
  label: string;
  defaultValue?: string | null;
  /** Existing categories, in the order their own admin page shows them. */
  options: CategoryOption[];
  /** Creates one and returns it. Omitted when the role may not. */
  createAction?: (
    title: string,
  ) => Promise<CategoryOption | { error: string }>;
  /** Shown under the field in the dialog. */
  hint?: string;
}

const NEW = "__new__";

/**
 * Category picker with an inline "new category" dialog.
 *
 * The list is whatever categories already exist, so nothing gets filed under a
 * category that exists nowhere else. Adding one is a dialog rather than a page:
 * leaving a half-filled form to go and create a category was how people lost
 * what they had typed.
 */
export default function CategorySelect({
  name,
  label,
  defaultValue,
  options,
  createAction,
  hint,
}: CategorySelectProps) {
  const [list, setList] = useState(options);
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // A row saved under a category that has since been renamed or deleted keeps
  // its own value in the list, so opening the form does not silently reassign
  // it.
  const all =
    value && !list.some((o) => o.value === value)
      ? [{ value, label: value }, ...list]
      : list;

  const submit = () => {
    const title = draft.trim();
    if (!title || !createAction) return;
    setError(null);
    startTransition(async () => {
      const result = await createAction(title);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setList((current) =>
        current.some((o) => o.value === result.value)
          ? current
          : [...current, result],
      );
      setValue(result.value);
      setDraft("");
      setOpen(false);
    });
  };

  return (
    <div>
      <label htmlFor={name} className="label">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => {
          if (e.target.value === NEW) {
            setOpen(true);
            return;
          }
          setValue(e.target.value);
        }}
        className="input"
      >
        <option value="">None</option>
        {all.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
        {createAction && <option value={NEW}>+ New category…</option>}
      </select>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <p className="font-bold text-navy">New category</p>
            {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                // Enter must not submit the form underneath the dialog.
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
                if (e.key === "Escape") setOpen(false);
              }}
              placeholder="e.g. Macro Research"
              className="input mt-3"
            />
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={submit}
                disabled={pending || !draft.trim()}
                className="btn-primary px-3 py-1.5 text-sm disabled:opacity-60"
              >
                {pending ? "Adding…" : "Add category"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                className="btn-secondary px-3 py-1.5 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
