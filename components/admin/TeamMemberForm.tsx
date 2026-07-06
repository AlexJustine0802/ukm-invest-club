"use client";

import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";

interface TeamMemberFormProps {
  action: (formData: FormData) => void;
  uploadEnabled: boolean;
  member?: {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    order: number;
    photo: string | null;
    linkedin: string | null;
    instagram: string | null;
  };
}

export default function TeamMemberForm({
  action,
  uploadEnabled,
  member,
}: TeamMemberFormProps) {
  return (
    <form action={action} className="space-y-5">
      {member && <input type="hidden" name="id" value={member.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="label">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={member?.name}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="role" className="label">
            Role
          </label>
          <input
            id="role"
            name="role"
            required
            defaultValue={member?.role}
            placeholder="e.g. President"
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="label">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={3}
          defaultValue={member?.bio ?? ""}
          className="input resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="order" className="label">
            Display order
          </label>
          <input
            id="order"
            name="order"
            type="number"
            defaultValue={member?.order ?? 0}
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
            type="url"
            defaultValue={member?.linkedin ?? ""}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="instagram" className="label">
            Instagram URL
          </label>
          <input
            id="instagram"
            name="instagram"
            type="url"
            defaultValue={member?.instagram ?? ""}
            className="input"
          />
        </div>
      </div>

      <ImageField
        label="Photo"
        defaultUrl={member?.photo}
        uploadEnabled={uploadEnabled}
      />

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={member ? "Save changes" : "Add member"} />
        <Link href="/admin/team" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
