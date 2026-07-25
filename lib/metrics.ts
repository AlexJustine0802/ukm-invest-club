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
 * Count every metric in one round of queries. Cheap enough to run on each
 * dashboard render — these are all indexed counts.
 */
export async function getMetricValues(
  now: Date = new Date(),
): Promise<Record<MetricId, number>> {
  const [
    upcomingEvents,
    pendingAssignments,
    careerAlerts,
    openRegistrations,
    resources,
    discussionChannels,
    members,
  ] = await Promise.all([
    prisma.event.count({
      where: { published: true, eventDate: { gte: now } },
    }),
    prisma.assignment.count({
      where: { published: true, status: "ACTIVE" },
    }),
    prisma.careerAlert.count({
      where: {
        published: true,
        OR: [{ deadline: null }, { deadline: { gte: now } }],
      },
    }),
    prisma.registrationForm.count({
      where: {
        published: true,
        OR: [{ opensAt: null }, { opensAt: { lte: now } }],
        AND: [{ OR: [{ closesAt: null }, { closesAt: { gte: now } }] }],
      },
    }),
    prisma.dashboardItem.count({
      where: { section: { in: ["folder", "resource"] }, active: true },
    }),
    prisma.discussionChannel.count({ where: { published: true } }),
    prisma.user.count(),
  ]);

  return {
    "upcoming-events": upcomingEvents,
    "pending-assignments": pendingAssignments,
    "career-alerts": careerAlerts,
    "open-registrations": openRegistrations,
    resources,
    "discussion-channels": discussionChannels,
    members,
  };
}
