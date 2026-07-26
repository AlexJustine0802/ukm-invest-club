/**
 * Asserts the hand-written SQL in lib/metrics.ts agrees with Prisma's own
 * counts.
 *
 * getMetricValues names tables and columns as string literals, so renaming a
 * model or field in schema.prisma breaks it silently — the query still runs,
 * it just counts the wrong thing or throws at runtime. Run this after any
 * schema change:
 *
 *   npx tsx --env-file=.env scripts/check-metrics.ts
 */
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { getMetricValues, METRICS } from "../lib/metrics";

const prisma = new PrismaClient();

async function main() {
  // One fixed timestamp for both sides, or a row crossing a deadline between
  // the two reads would look like a mismatch.
  const now = new Date();

  const fromSql = await getMetricValues(now);

  const [
    upcomingEvents,
    pendingAssignments,
    careerAlerts,
    openRegistrations,
    resources,
    discussionChannels,
    members,
  ] = await Promise.all([
    prisma.event.count({ where: { published: true, eventDate: { gte: now } } }),
    prisma.assignment.count({ where: { published: true, status: "ACTIVE" } }),
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

  const fromPrisma: Record<string, number> = {
    "upcoming-events": upcomingEvents,
    "pending-assignments": pendingAssignments,
    "career-alerts": careerAlerts,
    "open-registrations": openRegistrations,
    resources,
    "discussion-channels": discussionChannels,
    members,
  };

  for (const m of METRICS) {
    assert.equal(
      fromSql[m.id],
      fromPrisma[m.id],
      `${m.id}: raw SQL says ${fromSql[m.id]}, Prisma says ${fromPrisma[m.id]}`,
    );
    console.log(`  ok  ${m.id.padEnd(22)} = ${fromSql[m.id]}`);
  }

  console.log(`\nall ${METRICS.length} metrics agree`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err.message);
  await prisma.$disconnect();
  process.exit(1);
});
