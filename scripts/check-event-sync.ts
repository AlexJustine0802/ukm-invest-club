/**
 * Self-check for the form-owns-event architecture. Creates a throwaway form,
 * puts it through every sync path, and cleans up after itself.
 *
 *   npx tsx --env-file=.env scripts/check-event-sync.ts
 */
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { syncEventForForm, type EventDetails } from "../lib/eventSync";

const prisma = new PrismaClient();
const SLUG = `zz-sync-check-${Date.now()}`;

const details: EventDetails = {
  eventDate: new Date("2027-03-01T09:00:00Z"),
  endDate: new Date("2027-03-01T12:00:00Z"),
  location: "Test Hall",
  categoryId: null,
  seatUnit: "seats",
};

async function main() {
  // --- Create: a form with a start date also creates its event ---
  const form = await prisma.$transaction(async (tx) => {
    const created = await tx.registrationForm.create({
      data: {
        title: "Sync Check",
        slug: SLUG,
        description: "temporary",
        capacity: 40,
        published: true,
        questions: [],
      },
    });
    await syncEventForForm(tx, created, details);
    return created;
  });

  let event = await prisma.event.findUnique({
    where: { registrationFormId: form.id },
  });
  assert.ok(event, "creating a form with a start date must create its event");
  assert.equal(event.title, "Sync Check");
  assert.equal(event.slug, SLUG, "event slug follows the form slug");
  assert.equal(event.capacity, 40, "capacity is shared");
  assert.equal(event.published, true);
  assert.equal(event.location, "Test Hall");

  // --- Update: edits and visibility propagate ---
  await prisma.$transaction(async (tx) => {
    const updated = await tx.registrationForm.update({
      where: { id: form.id },
      data: { title: "Sync Check Renamed", capacity: 10, published: false },
    });
    await syncEventForForm(tx, updated, { ...details, location: "Moved" });
  });

  event = await prisma.event.findUnique({
    where: { registrationFormId: form.id },
  });
  assert.equal(event?.title, "Sync Check Renamed", "title propagates");
  assert.equal(event?.capacity, 10, "capacity propagates");
  assert.equal(event?.published, false, "hiding the form hides the event");
  assert.equal(event?.location, "Moved", "event-only fields propagate");

  // --- Clearing the start date drops the event, keeping the form ---
  await prisma.$transaction(async (tx) => {
    const current = await tx.registrationForm.findUniqueOrThrow({
      where: { id: form.id },
    });
    await syncEventForForm(tx, current, null);
  });
  assert.equal(
    await prisma.event.count({ where: { registrationFormId: form.id } }),
    0,
    "a form with no start date must have no event",
  );
  assert.ok(
    await prisma.registrationForm.findUnique({ where: { id: form.id } }),
    "the form itself survives",
  );

  // --- Delete: the event goes with the form (database cascade) ---
  await prisma.$transaction(async (tx) => {
    const current = await tx.registrationForm.findUniqueOrThrow({
      where: { id: form.id },
    });
    await syncEventForForm(tx, current, details);
  });
  const readded = await prisma.event.findUniqueOrThrow({
    where: { registrationFormId: form.id },
  });

  await prisma.registrationForm.delete({ where: { id: form.id } });
  assert.equal(
    await prisma.event.count({ where: { id: readded.id } }),
    0,
    "deleting a form must cascade to its event",
  );

  // --- The invariant: no event may exist without a form ---
  const orphans = await prisma.$queryRawUnsafe<{ n: bigint }[]>(
    `select count(*)::bigint as n from "Event" e
     left join "RegistrationForm" f on f.id = e."registrationFormId"
     where f.id is null`,
  );
  assert.equal(Number(orphans[0].n), 0, "no orphaned events");

  console.log("event/form sync OK");
}

main()
  .catch(async (error) => {
    await prisma.registrationForm
      .deleteMany({ where: { slug: SLUG } })
      .catch(() => {});
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
