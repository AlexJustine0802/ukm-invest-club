/**
 * Give every existing event a registration form, so "Register" on the public
 * events page always opens a form. Events created from now on get one
 * automatically (see app/admin/(dashboard)/events/actions.ts).
 *
 * Safe to re-run: events that already have a form are skipped.
 *
 *   npx tsx scripts/backfill-event-forms.ts
 */
import { PrismaClient } from "@prisma/client";
import { ensureEventForm } from "../lib/eventForms";

const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany({
    orderBy: { eventDate: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      eventDate: true,
      capacity: true,
      registrationFormId: true,
    },
  });

  let created = 0;
  for (const event of events) {
    const had = Boolean(event.registrationFormId);
    const slug = await ensureEventForm(prisma, event);
    if (!had) created++;
    console.log(`${had ? "skip" : "form"}  ${event.title} → /register/${slug}`);
  }

  console.log(`\n${created} form(s) created, ${events.length - created} already linked.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
