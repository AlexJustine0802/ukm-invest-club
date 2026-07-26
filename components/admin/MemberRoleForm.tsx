"use client";

import { useState } from "react";
import Spinner from "@/components/Spinner";
import { useFormStatus } from "react-dom";
import { DIVISIONS, GENERAL_ROLES, rolesFor } from "@/lib/roles";

function Save() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary px-4 py-2 text-xs disabled:opacity-60"
    >
      {pending && <Spinner />}
      {pending ? "Saving…" : "Save"}
    </button>
  );
}

/**
 * Division and role selects for one member. The role list follows the chosen
 * division, so an admin can only pick positions that exist there.
 */
export default function MemberRoleForm({
  action,
  userId,
  division,
  role,
}: {
  action: (formData: FormData) => void;
  userId: string;
  division: string | null;
  role: string;
}) {
  const [picked, setPicked] = useState(division ?? "");
  const options = picked ? rolesFor(picked) : GENERAL_ROLES;

  // Keep the current role selected while it is still valid for the division.
  const selectedRole = options.includes(role) ? role : options[0];

  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={userId} />

      <select
        name="division"
        value={picked}
        onChange={(e) => setPicked(e.target.value)}
        className="input w-auto py-2 text-xs"
        aria-label="Division"
      >
        <option value="">No division</option>
        {DIVISIONS.map((d) => (
          <option key={d.slug} value={d.slug}>
            {d.name}
          </option>
        ))}
      </select>

      <select
        name="role"
        defaultValue={selectedRole}
        key={picked} // remount so the selection resets when the division changes
        className="input w-auto py-2 text-xs"
        aria-label="Role"
      >
        {options.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <Save />
    </form>
  );
}
