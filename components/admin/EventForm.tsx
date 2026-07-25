"use client";

import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import SubmitButton from "@/components/admin/SubmitButton";
import { toDateTimeLocalValue } from "@/lib/utils";

interface EventFormProps {
  action: (formData: FormData) => void;
  uploadEnabled: boolean;
  categories: { id: string; title: string }[];
  /** Public sign-up forms an event's Register button can point at. */
  registrationForms: { id: string; title: string }[];
  event?: {
    id: string;
    title: string;
    description: string;
    eventDate: Date;
    location: string | null;
    coverImage: string | null;
    published: boolean;
    categoryId: string | null;
    endDate: Date | null;
    capacity: number | null;
    seatUnit: string;
    registrationFormId: string | null;
  };
}

export default function EventForm({
  action,
  uploadEnabled,
  categories,
  registrationForms,
  event,
}: EventFormProps) {
  return (
    <form action={action} className="space-y-5">
      {event && <input type="hidden" name="id" value={event.id} />}

      <div>
        <label htmlFor="title" className="label">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={event?.title}
          className="input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="eventDate" className="label">
            Date &amp; time
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="datetime-local"
            required
            defaultValue={
              event ? toDateTimeLocalValue(event.eventDate) : undefined
            }
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
            defaultValue={event?.location ?? ""}
            placeholder="e.g. Auditorium / Online"
            className="input"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="endDate" className="label">
            End time <span className="text-slate-400">(optional)</span>
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
        <div>
          <label htmlFor="capacity" className="label">
            Capacity <span className="text-slate-400">(blank = unlimited)</span>
          </label>
          <input
            id="capacity"
            name="capacity"
            type="number"
            min={0}
            defaultValue={event?.capacity ?? ""}
            placeholder="e.g. 60"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="seatUnit" className="label">
            Counted in
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
        <label htmlFor="registrationFormId" className="label">
          Registration form <span className="text-slate-400">(optional)</span>
        </label>
        <select
          id="registrationFormId"
          name="registrationFormId"
          defaultValue={event?.registrationFormId ?? ""}
          className="input"
        >
          <option value="">None — “Register Now” opens the event page</option>
          {registrationForms.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">
          Pick a form and the “Register Now” button on the public events page
          opens it directly. Create forms under Registrations.
        </p>
      </div>

      <div>
        <label htmlFor="description" className="label">
          Description <span className="text-slate-400">(Markdown supported)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={10}
          required
          defaultValue={event?.description}
          className="input resize-y font-mono text-sm"
        />
      </div>

      <ImageField
        label="Cover image"
        defaultUrl={event?.coverImage}
        uploadEnabled={uploadEnabled}
      />

      <label className="flex items-center gap-2 text-sm text-navy">
        <input
          type="checkbox"
          name="published"
          defaultChecked={event ? event.published : true}
          className="h-4 w-4 rounded border-slate-300"
        />
        Published (visible on the website)
      </label>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={event ? "Save changes" : "Create event"} />
        <Link href="/admin/events" className="btn-secondary">
          Cancel
        </Link>
      </div>
    </form>
  );
}
