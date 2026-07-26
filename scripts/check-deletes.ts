/**
 * Asserts deleteIfExists swallows only "already gone" and nothing else.
 *
 *   npx tsx --env-file=.env scripts/check-deletes.ts
 */
import assert from "node:assert/strict";
import { PrismaClient, Prisma } from "@prisma/client";
import { deleteIfExists } from "../lib/deletes";

const prisma = new PrismaClient();

async function main() {
  // 1. Deleting a row that never existed returns null instead of throwing.
  //    This is the double-clicked delete button.
  const missing = await deleteIfExists(() =>
    prisma.registrationForm.delete({ where: { id: "zz-does-not-exist" } }),
  );
  assert.equal(missing, null, "missing row should resolve to null");
  console.log("  ok  missing row -> null (no throw)");

  // 2. Deleting the same row twice: the first succeeds, the second is a no-op.
  const form = await prisma.registrationForm.create({
    data: {
      title: "zz delete check",
      slug: `zz-delete-check-${Date.now()}`,
      questions: [] as unknown as Prisma.InputJsonValue,
      published: false,
    },
  });
  const first = await deleteIfExists(() =>
    prisma.registrationForm.delete({ where: { id: form.id } }),
  );
  assert.ok(first, "first delete should return the row");
  const second = await deleteIfExists(() =>
    prisma.registrationForm.delete({ where: { id: form.id } }),
  );
  assert.equal(second, null, "second delete should be a no-op");
  console.log("  ok  double delete -> row, then null");

  // 3. Errors that are NOT P2025 must still propagate — swallowing a genuine
  //    failure would be far worse than the bug this fixes.
  await assert.rejects(
    () =>
      deleteIfExists(async () => {
        throw new Prisma.PrismaClientKnownRequestError("fk violation", {
          code: "P2003",
          clientVersion: "test",
        });
      }),
    /fk violation/,
    "non-P2025 errors must not be swallowed",
  );
  console.log("  ok  other Prisma errors still throw");

  console.log("\nall delete guards behave");
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("FAILED:", err.message);
  await prisma.$disconnect();
  process.exit(1);
});
