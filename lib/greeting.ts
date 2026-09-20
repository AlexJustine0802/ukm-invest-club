/**
 * Time-of-day greeting.
 *
 * The boundaries live here as one table so they can be moved in a single edit:
 * each entry is the hour the label starts at, latest first.
 */
const PARTS = [
  { from: 18, label: "Good night" },
  { from: 15, label: "Good evening" },
  { from: 12, label: "Good afternoon" },
  { from: 0, label: "Good morning" },
] as const;

export function greetingFor(date: Date = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      hour: "numeric",
      hourCycle: "h23",
    }).format(date),
  );
  return PARTS.find((p) => hour >= p.from)!.label;
}
