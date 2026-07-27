import { Prisma } from "@prisma/client";

/**
 * Runs a Prisma delete, treating "the row is already gone" as success.
 *
 * `delete()` throws P2025 when nothing matches, which turns an ordinary race
 * into a 500: a double-clicked button, two admins on the same list, or a tab
 * left open after someone else deleted the row. In every one of those cases
 * the caller's intent  that this record should not exist  is already
 * satisfied, so failing is the wrong answer.
 *
 * Returns the deleted record, or null if it had already gone. Anything other
 * than P2025 still throws: a foreign-key violation or a lost connection is a
 * real error and must not be swallowed.
 */
export async function deleteIfExists<T>(
  run: () => Promise<T>,
): Promise<T | null> {
  try {
    return await run();
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return null;
    }
    throw err;
  }
}
