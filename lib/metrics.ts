import { prisma } from "@/lib/prisma";

/**
 * Live numbers for the dashboard's Overview cards. An overview item with a
 * `metric` key shows the current count instead of a hand-typed value, so
 * publishing a career alert or an event updates the card on its own.
 */
export const METRICS = [
  { id: "upcoming-events", label: "Upcoming events" },
  { id: "pending-assignments", label: "Pending assignments" },
  { id: "career-alerts", label: "Open career alerts" },
  { id: "open-registrations", label: "Open registrations" },
  { id: "resources", label: "Resources available" },
  { id: "discussion-channels", label: "Discussion channels" },
  { id: "members", label: "Registered members" },
] as const;

export type MetricId = (typeof METRICS)[number]["id"];

export function isMetric(value: string): value is MetricId {
  return METRICS.some((m) => m.id === value);
}

export function metricLabel(id: string | null | undefined): string | null {
  return METRICS.find((m) => m.id === id)?.label ?? null;
}

/**
 * Best-guess metric for an overview card that predates the dropdown, so cards
 * called "Career Alerts" or "Upcoming Events" count themselves without anyone
 * re-editing them. Picking a metric explicitly always wins over this.
 */
export function inferMetric(title: string): MetricId | null {
  const t = title.toLowerCase();
  if (t.includes("career") || t.includes("job")) return "career-alerts";
  if (t.includes("event")) return "upcoming-events";
  if (t.includes("assignment") || t.includes("task")) return "pending-assignments";
  if (t.includes("registration") || t.includes("recruit")) return "open-registrations";
  if (t.includes("resource")) return "resources";
  if (t.includes("discussion") || t.includes("channel")) return "discussion-channels";
  if (t.includes("member")) return "members";
  return null;
}

/** The metric a card should use: the chosen one, else a guess from its label. */
export function resolveMetric(
  metric: string | null | undefined,
  title: string,
): MetricId | null {
  if (metric && isMetric(metric)) return metric;
  return inferMetric(title);
}

/**
 * Count every metric in a single round trip.
 *
 * This was seven parallel `count()` calls. Each one holds its own connection,
 * so a single dashboard render opened seven at once — and with the six other
 * queries on that page, fourteen simultaneously, against a Supavisor ceiling
 * of fifteen. One visitor could exhaust the pool on their own and the next
 * request got `EMAXCONNSESSION`.
 *
 * The subqueries are the same indexed counts as before; the win is entirely in
 * connection use. Table and column names are literal here, so
 * scripts/check-metrics.ts asserts this agrees with Prisma's own counts —
 * run it after renaming any model or field.
 */
export async function getMetricValues(
  now: Date = new Date(),
): Promise<Record<MetricId, number>> {
  const [row] = await prisma.$queryRaw<Record<MetricId, bigint>[]>`
    SELECT
      (SELECT count(*) FROM "Event"
        WHERE published = true AND "eventDate" >= ${now})           AS "upcoming-events",
      (SELECT count(*) FROM "Assignment"
        WHERE published = true AND status = 'ACTIVE')               AS "pending-assignments",
      (SELECT count(*) FROM "CareerAlert"
        WHERE published = true
          AND (deadline IS NULL OR deadline >= ${now}))             AS "career-alerts",
      (SELECT count(*) FROM "RegistrationForm"
        WHERE published = true
          AND ("opensAt"  IS NULL OR "opensAt"  <= ${now})
          AND ("closesAt" IS NULL OR "closesAt" >= ${now}))         AS "open-registrations",
      (SELECT count(*) FROM "DashboardItem"
        WHERE section IN ('folder','resource') AND active = true)   AS "resources",
      (SELECT count(*) FROM "DiscussionChannel"
        WHERE published = true)                                     AS "discussion-channels",
      (SELECT count(*) FROM "User")                                 AS "members"
  `;

  // Postgres count() arrives as bigint; every caller wants a number.
  return Object.fromEntries(
    METRICS.map((m) => [m.id, Number(row[m.id])]),
  ) as Record<MetricId, number>;
}
