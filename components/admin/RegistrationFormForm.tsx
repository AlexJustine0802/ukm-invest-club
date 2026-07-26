import Link from "next/link";
import SubmitButton from "@/components/admin/SubmitButton";
import FormQuestionsEditor from "@/components/admin/FormQuestionsEditor";
import { UI_ICON_KEYS } from "@/lib/uiIcons";
import { EVENT_COLOR_KEYS } from "@/lib/eventStyles";
import { AUDIENCES, parseQuestions } from "@/lib/forms";
import { toDateTimeLocalValue } from "@/lib/utils";

interface RegistrationFormFormProps {
  action: (formData: FormData) => void;
  form?: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    coverImage: string | null;
    audience: string;
    multipleResponses: boolean;
    isRecruitment: boolean;
    questions: unknown;
    opensAt: Date | null;
    closesAt: Date | null;
    capacity: number | null;
    published: boolean;
    order: number;
    icon: string | null;
    color: string | null;
  };
  /** Event categories for the public listing. */
  categories?: { id: string; title: string }[];
  /**
   * The public event this form owns. Null when the form is a plain sign-up
   * (recruitment, standalone) with no event.
   */
  event?: {
    eventDate: Date;
    endDate: Date | null;
    location: string | null;
    categoryId: string | null;
    seatUnit: string;
  } | null;
}

export default function RegistrationFormForm({
  action,
  form,
  categories = [],
  event,
}: RegistrationFormFormProps) {
  return (
    <form action={action} className="space-y-6">
      {form && <input type="hidden" name="id" value={form.id} />}

      <div className="card space-y-5 p-5">
        <p className="font-bold text-navy">Details</p>

        <div>
          <label htmlFor="title" className="label">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={form?.title}
            placeholder="e.g. Staff Recruitment 2026"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="slug" className="label">
            Link slug <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="slug"
            name="slug"
            defaultValue={form?.slug}
            placeholder="left blank = made from the title"
            className="input"
          />
          <p className="mt-1 text-xs text-slate-500">
            The form lives at <code>/register/&lt;slug&gt;</code> — share that link.
          </p>
        </div>

        <div>
          <label htmlFor="description" className="label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={form?.description ?? ""}
            placeholder="What this registration is for, who can apply, what happens next."
            className="input"
          />
        </div>

        <div>
          <label htmlFor="coverImage" className="label">
            Cover image URL <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="coverImage"
            name="coverImage"
            defaultValue={form?.coverImage ?? ""}
            placeholder="https://..."
            className="input"
          />
        </div>
      </div>

      <div className="card space-y-5 p-5">
        <p className="font-bold text-navy">Who and when</p>

        <div>
          <label htmlFor="audience" className="label">
            Who can fill this in
          </label>
          <select
            id="audience"
            name="audience"
            defaultValue={form?.audience ?? "MEMBERS"}
            className="input"
          >
            {AUDIENCES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label} — {a.hint}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="opensAt" className="label">
              Opens <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="opensAt"
              name="opensAt"
              type="datetime-local"
              defaultValue={
                form?.opensAt ? toDateTimeLocalValue(form.opensAt) : undefined
              }
              className="input"
            />
          </div>
          <div>
            <label htmlFor="closesAt" className="label">
              Closes <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="closesAt"
              name="closesAt"
              type="datetime-local"
              defaultValue={
                form?.closesAt ? toDateTimeLocalValue(form.closesAt) : undefined
              }
              className="input"
            />
          </div>
          <div>
            <label htmlFor="capacity" className="label">
              Max responses <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              defaultValue={form?.capacity ?? undefined}
              placeholder="unlimited"
              className="input"
            />
            <p className="mt-1 text-xs text-slate-500">
              Doubles as the event capacity.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="multipleResponses"
            defaultChecked={form?.multipleResponses ?? false}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium text-navy">
            Allow more than one response per person
          </span>
        </label>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="isRecruitment"
            defaultChecked={form?.isRecruitment ?? false}
            className="mt-1 h-4 w-4"
          />
          <span className="text-sm font-medium text-navy">
            This is the club recruitment
            <span className="mt-0.5 block text-xs font-normal text-slate-500">
              Drives the Recruitment page in the member area. Outside the open
              and close dates that page shows a “not open yet / closed” notice.
            </span>
          </span>
        </label>
      </div>

      <div className="card space-y-5 p-5">
        <div>
          <p className="font-bold text-navy">Event details</p>
          <p className="mt-1 text-sm text-slate-500">
            Fill in a start date and this form also becomes a public event —
            listed on the website, in the member dashboard, and registering
            through this form. Leave the start date blank for a plain sign-up
            (recruitment, standalone) with no event.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="eventDate" className="label">
              Start date &amp; time
            </label>
            <input
              id="eventDate"
              name="eventDate"
              type="datetime-local"
              defaultValue={
                event ? toDateTimeLocalValue(event.eventDate) : undefined
              }
              className="input"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="label">
              End date &amp; time <span className="text-slate-400">(optional)</span>
            </label>
            <input
              id="endDate"
              name="endDate"
              type="datetime-local"
              defaultValue={
                event?.endDate ? toDateTimeLocalValue(event.endDate) : undefined
              }
              className="input"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="location" className="label">
              Location
            </label>
            <input
              id="location"
              name="location"
              defaultValue={event?.location ?? ""}
              placeholder="e.g. Auditorium / Online"
              className="input"
            />
          </div>
          <div>
            <label htmlFor="categoryId" className="label">
              Category
            </label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={event?.categoryId ?? ""}
              className="input"
            >
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="seatUnit" className="label">
              Seats counted in
            </label>
            <select
              id="seatUnit"
              name="seatUnit"
              defaultValue={event?.seatUnit ?? "seats"}
              className="input"
            >
              <option value="seats">seats</option>
              <option value="teams">teams</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card space-y-5 p-5">
        <div>
          <p className="font-bold text-navy">Questions</p>
          <p className="mt-1 text-sm text-slate-500">
            Short answer, essay, multiple choice, checkboxes, dropdown, date, or
            a file/picture upload with its own size limit.
          </p>
        </div>
        <FormQuestionsEditor
          name="questions"
          initial={parseQuestions(form?.questions)}
        />
      </div>

      <div className="card space-y-5 p-5">
        <p className="font-bold text-navy">Display</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="icon" className="label">
              Icon
            </label>
            <select
              id="icon"
              name="icon"
              defaultValue={form?.icon ?? "ClipboardList"}
              className="input"
            >
              {UI_ICON_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="color" className="label">
              Colour
            </label>
            <select
              id="color"
              name="color"
              defaultValue={form?.color ?? EVENT_COLOR_KEYS[0]}
              className="input"
            >
              {EVENT_COLOR_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="order" className="label">
              Display order
            </label>
            <input
              id="order"
              name="order"
              type="number"
              defaultValue={form?.order ?? 0}
              className="input"
            />
          </div>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="published"
            defaultChecked={form ? form.published : true}
            className="h-4 w-4"
          />
          <span className="text-sm font-medium text-navy">
            Published — the link works and members can see it
            <span className="mt-0.5 block text-xs font-normal text-slate-500">
              Also controls the event: unpublishing hides it from the public
              events page and the member dashboard.
            </span>
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label={form ? "Save changes" : "Create form"} />
        <Link href="/admin/registrations" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
