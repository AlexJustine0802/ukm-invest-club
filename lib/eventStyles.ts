// Badge / seat-counter colours for the member events page. Categories can set their
// own `color` key in the admin; anything unset falls back by name so the page
// never renders an uncoloured card.

export interface EventPalette {
  badge: string;
  seats: string;
}

export const EVENT_PALETTES: Record<string, EventPalette> = {
  blue: {
    badge: "bg-blue-50 text-primary",
    seats: "text-primary",
  },
  green: {
    badge: "bg-emerald-50 text-emerald-700",
    seats: "text-emerald-700",
  },
  violet: {
    badge: "bg-violet-50 text-violet-700",
    seats: "text-violet-700",
  },
  amber: {
    badge: "bg-amber-50 text-amber-700",
    seats: "text-amber-700",
  },
  rose: {
    badge: "bg-rose-50 text-rose-700",
    seats: "text-rose-700",
  },
};

export const EVENT_COLOR_KEYS = Object.keys(EVENT_PALETTES);

import { currentWallClockAsUtc } from "@/lib/wallClock";

// Event datetime fields are stored as the wall-clock values entered in the
// admin form. They use UTC components in the database so every server reads
// the same WIB clock value.
export const EVENT_TIME_ZONE = "UTC";

/** Stable fallback so a category without a colour still looks deliberate. */
function fallbackKey(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  return EVENT_COLOR_KEYS[Math.abs(hash) % EVENT_COLOR_KEYS.length];
}

export function eventPalette(
  color: string | null | undefined,
  seed = "",
): EventPalette {
  if (color && EVENT_PALETTES[color]) return EVENT_PALETTES[color];
  return EVENT_PALETTES[fallbackKey(seed)];
}

/** "13.00 – 16.00 WIB", or just the start when there is no end time. */
export function timeRange(start: Date, end: Date | null): string {
  const fmt = (d: Date) =>
    d
      .toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: EVENT_TIME_ZONE,
      })
      .replace(":", ".");
  return end ? `${fmt(start)} – ${fmt(end)} WIB` : `${fmt(start)} WIB`;
}

/**
 * Parse a `?m=YYYY-MM` calendar param into the month it names, falling back to
 * the current month on anything missing or malformed.
 */
export function monthRange(param: string | undefined): {
  year: number;
  month: number; // 0-indexed, like Date
  start: Date;
  end: Date; // exclusive: the first instant of the next month
} {
  const now = currentWallClockAsUtc();
  let year = now.getUTCFullYear();
  let month = now.getUTCMonth();

  const match = /^(\d{4})-(\d{2})$/.exec(param ?? "");
  if (match) {
    const y = Number(match[1]);
    const m = Number(match[2]) - 1;
    if (m >= 0 && m <= 11) {
      year = y;
      month = m;
    }
  }

  return {
    year,
    month,
    start: new Date(Date.UTC(year, month, 1)),
    end: new Date(Date.UTC(year, month + 1, 1)),
  };
}

/** "?m=" value for a month offset from the given one, e.g. -1 for previous. */
export function monthParam(year: number, month: number, offset = 0): string {
  const d = new Date(Date.UTC(year, month + offset, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** "July 2025" */
export function monthLabel(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: EVENT_TIME_ZONE,
  });
}

/** "18 July 2025 (Friday)" */
export function eventDateLabel(date: Date): string {
  const day = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: EVENT_TIME_ZONE,
  });
  const weekday = date.toLocaleDateString("en-GB", {
    weekday: "long",
    timeZone: EVENT_TIME_ZONE,
  });
  return `${day} (${weekday})`;
}

/** Value for an event's datetime-local admin input in the event timezone. */
export function eventDateTimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
    date.getUTCDate(),
  )}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}
