/**
 * datetime-local values have no timezone. Store those wall-clock values as
 * UTC components so the same value is preserved on every server. The club's
 * displayed timezone is WIB (Asia/Jakarta).
 */
export const CLUB_TIME_ZONE = "Asia/Jakarta";

export function parseWallClockDateTime(value: string): Date {
  return new Date(`${value}:00.000Z`);
}

/** Encode the current WIB wall clock with UTC components for comparisons. */
export function currentWallClockAsUtc(now = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: CLUB_TIME_ZONE,
    calendar: "gregory",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(now);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return new Date(
    Date.UTC(
      value("year"),
      value("month") - 1,
      value("day"),
      value("hour"),
      value("minute"),
      value("second"),
    ),
  );
}
