import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import ImageField from "@/components/admin/ImageField";
import { toDateTimeLocalValue } from "@/lib/utils";

interface CareerAlertFormProps {
  action: (formData: FormData) => void;
  /** Whether file uploads are configured (Vercel Blob). */
  uploadEnabled?: boolean;
  alert?: {
    id: string;
    company: string;
    role: string;
    location: string | null;
    workType: string;
    description: string | null;
    applyUrl: string | null;
    deadline: Date | null;
    logo: string | null;
    companyIndustry: string | null;
    companySize: string | null;
    companyWebsite: string | null;
    companyProfile: string | null;
    published: boolean;
    announced: boolean;
    highlighted: boolean;
  };
}

// Headings and bullets survive to the member page, which renders Markdown.
const PLACEHOLDER = [
  "What the role involves, who it suits, requirements.",
  "",
  "## What would you do?",
  "- Task one",
  "- Task two",
  "",
  "## Qualifications",
  "- Requirement one",
].join("\n");

const COMPANY_PLACEHOLDER = [
  "What the company does, and what it is like to work there.",
  "",
  "## Benefits",
  "- Medical",
  "- Transport & meal allowance",
].join("\n");

export default function CareerAlertForm({
  action,
  alert,
  uploadEnabled = false,
}: CareerAlertFormProps) {
  return (
    <form action={action} className="space-y-5">
      {alert && <input type="hidden" name="id" value={alert.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="role" className="label">
            Role
          </label>
          <input
            id="role"
            name="role"
            required
            defaultValue={alert?.role}
            placeholder="e.g. Equity Research Intern"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="company" className="label">
            Company
          </label>
          <input
            id="company"
            name="company"
            required
            defaultValue={alert?.company}
            placeholder="e.g. Mandiri Sekuritas"
            className="input"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="workType" className="label">
            Type
          </label>
          <input
            id="workType"
            name="workType"
            defaultValue={alert?.workType ?? "Internship"}
            placeholder="e.g. Internship, Full-time, Part-time"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="location" className="label">
            Location
          </label>
          <input
            id="location"
            name="location"
            defaultValue={alert?.location ?? ""}
            placeholder="e.g. Jakarta (Hybrid)"
            className="input"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={10}
          defaultValue={alert?.description ?? ""}
          placeholder={PLACEHOLDER}
          className="input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="applyUrl" className="label">
            Apply link
          </label>
          <input
            id="applyUrl"
            name="applyUrl"
            type="url"
            defaultValue={alert?.applyUrl ?? ""}
            placeholder="https://..."
            className="input"
          />
        </div>
        <div>
          <label htmlFor="deadline" className="label">
            Application deadline <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="deadline"
            name="deadline"
            type="datetime-local"
            defaultValue={
              alert?.deadline ? toDateTimeLocalValue(alert.deadline) : undefined
            }
            className="input"
          />
        </div>
      </div>

      {/* Company profile — shown as its own block under the posting. */}
      <div className="space-y-4 rounded-lg border border-slate-200 p-4">
        <div>
          <p className="font-bold text-navy">Company profile</p>
        </div>

        <ImageField
          label="Company logo"
          defaultUrl={alert?.logo}
          uploadEnabled={uploadEnabled}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="companyIndustry" className="label">
              Industry
            </label>
            <input
              id="companyIndustry"
              name="companyIndustry"
              defaultValue={alert?.companyIndustry ?? ""}
              placeholder="e.g. Education & Training"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="companySize" className="label">
              Size
            </label>
            <input
              id="companySize"
              name="companySize"
              defaultValue={alert?.companySize ?? ""}
              placeholder="e.g. 51-100 employees"
              className="input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="companyWebsite" className="label">
            Website
          </label>
          <input
            id="companyWebsite"
            name="companyWebsite"
            type="url"
            defaultValue={alert?.companyWebsite ?? ""}
            placeholder="https://..."
            className="input"
          />
        </div>

        <div>
          <label htmlFor="companyProfile" className="label">
            About the company
          </label>
          <textarea
            id="companyProfile"
            name="companyProfile"
            rows={6}
            defaultValue={alert?.companyProfile ?? ""}
            placeholder={COMPANY_PLACEHOLDER}
            className="input"
          />
        </div>
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="published"
          defaultChecked={alert ? alert.published : true}
          className="h-4 w-4"
        />
        <span className="text-sm font-medium text-navy">
          Published
        </span>
      </label>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="announced"
          defaultChecked={alert?.announced ?? false}
          className="mt-1 h-4 w-4"
        />
        <span className="text-sm font-medium text-navy">
          Announce this
        </span>
      </label>

      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          name="highlighted"
          defaultChecked={alert?.highlighted ?? false}
          className="mt-1 h-4 w-4"
        />
        <span className="text-sm font-medium text-navy">
          Highlight this
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={alert ? "Save changes" : "Post job"} />
        <Link href="/admin/career" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
