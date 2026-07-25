"use client";

import { useState } from "react";
import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import { DIVISIONS, GENERAL_ROLES, rolesFor } from "@/lib/roles";

/**
 * The one place a person's record is edited. Division and role drive both the
 * member area and "Our Divisions" on the public site; photo, bio and social
 * links are what the public card shows.
 */
export default function MemberProfileForm({
  action,
  member,
}: {
  action: (formData: FormData) => void;
  member: {
    id: string;
    name: string;
    email: string;
    role: string;
    division: string | null;
    photo: string | null;
    bio: string | null;
    instagram: string | null;
    linkedin: string | null;
  };
}) {
  const [picked, setPicked] = useState(member.division ?? "");
  const options = picked ? rolesFor(picked) : GENERAL_ROLES;
  const selectedRole = options.includes(member.role) ? member.role : options[0];

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={member.id} />

      <div>
        <label htmlFor="name" className="label">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={member.name}
          className="input"
        />
      </div>

      <div>
        <label className="label">Email</label>
        <input value={member.email} disabled className="input bg-slate-50" />
        <p className="mt-1 text-xs text-slate-500">
          The member changes this themselves; it is never shown publicly.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="division" className="label">
            Division
          </label>
          <select
            id="division"
            name="division"
            value={picked}
            onChange={(e) => setPicked(e.target.value)}
            className="input"
          >
            <option value="">No division</option>
            {DIVISIONS.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="role" className="label">
            Role
          </label>
          <select
            id="role"
            name="role"
            key={picked}
            defaultValue={selectedRole}
            className="input"
          >
            {options.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <p className="rounded-xl bg-blue-50 p-3 text-xs text-slate-600">
        Anyone with a division appears in “Our Divisions” on the public About
        page, head first. Members with no division stay internal.
      </p>

      <div>
        <label htmlFor="photoFile" className="label">
          Photo
        </label>
        <input
          id="photoFile"
          name="photoFile"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy hover:file:bg-slate-200"
        />
        <input
          name="photo"
          defaultValue={member.photo ?? ""}
          placeholder="…or paste an image URL"
          className="input mt-2"
        />
      </div>

      <div>
        <label htmlFor="bio" className="label">
          Short bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={member.bio ?? ""}
          placeholder="One or two sentences shown on the public card."
          className="input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="instagram" className="label">
            Instagram URL
          </label>
          <input
            id="instagram"
            name="instagram"
            defaultValue={member.instagram ?? ""}
            placeholder="https://instagram.com/..."
            className="input"
          />
        </div>
        <div>
          <label htmlFor="linkedin" className="label">
            LinkedIn URL
          </label>
          <input
            id="linkedin"
            name="linkedin"
            defaultValue={member.linkedin ?? ""}
            placeholder="https://linkedin.com/in/..."
            className="input"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label="Save member" />
        <Link href="/admin/members" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
