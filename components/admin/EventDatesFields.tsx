"use client";

import { useState } from "react";

/**
 * "Show on the public Events page" and the start date that makes it possible.
 *
 * They are one control in two parts: ticking the box without a start date used
 * to save quietly as a link-only form, leaving someone waiting for an event
 * that was never created. Tying `required` to the tickbox makes that
 * impossible to submit instead of silently ignored.
 */
export default function EventDatesFields({
  defaultChecked,
  defaultEventDate,
  defaultEndDate,
}: {
  defaultChecked: boolean;
  defaultEventDate?: string;
  defaultEndDate?: string;
}) {
  const [showOnEvents, setShowOnEvents] = useState(defaultChecked);

  return (
    <>
      <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
        <input
          type="checkbox"
          name="showOnEvents"
          checked={showOnEvents}
          onChange={(e) => setShowOnEvents(e.target.checked)}
          className="mt-0.5 h-4 w-4"
        />
        <span>
          <span className="font-semibold text-navy">
            Show this on the public Events page
          </span>
          <span className="mt-0.5 block text-xs text-slate-500">
            Needs a start date below. Leave unticked for a sign-up that is
            shared by link only — a recruitment, for example. Unticking it
            later removes the public event; the form and its responses stay.
          </span>
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="eventDate" className="label">
            Start date &amp; time
            {showOnEvents && <span className="ml-1 text-rose-500">*</span>}
          </label>
          <input
            id="eventDate"
            name="eventDate"
            type="datetime-local"
            required={showOnEvents}
            defaultValue={defaultEventDate}
            className="input"
          />
          {showOnEvents && (
            <p className="mt-1 text-xs text-slate-500">
              Without this the form saves as a link-only sign-up and no event
              appears.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="endDate" className="label">
            End date &amp; time <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="endDate"
            name="endDate"
            type="datetime-local"
            defaultValue={defaultEndDate}
            className="input"
          />
        </div>
      </div>
    </>
  );
}
