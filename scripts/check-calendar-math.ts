/**
 * Self-check for the calendar month maths — the one bit of the new pages with
 * real branching (param parsing, year wrap, leap years).
 *
 *   npx tsx scripts/check-calendar-math.ts
 */
import assert from "node:assert/strict";
import { monthRange, monthParam, monthLabel } from "../lib/eventStyles";
import { deadlineLabel } from "../lib/career";

// Parses a valid ?m=
const july = monthRange("2025-07");
assert.equal(july.year, 2025);
assert.equal(july.month, 6);
assert.equal(july.start.getTime(), new Date(2025, 6, 1).getTime());
assert.equal(july.end.getTime(), new Date(2025, 7, 1).getTime());
assert.equal(monthLabel(july.year, july.month), "July 2025");

// Garbage and month 13 fall back to the current month.
const now = new Date();
for (const bad of [undefined, "", "nope", "2025-13", "2025-00", "202507"]) {
  const r = monthRange(bad);
  assert.equal(r.year, now.getFullYear(), `fallback year for ${bad}`);
  assert.equal(r.month, now.getMonth(), `fallback month for ${bad}`);
}

// Year wrap in both directions.
assert.equal(monthParam(2025, 0, -1), "2024-12");
assert.equal(monthParam(2025, 11, 1), "2026-01");
assert.equal(monthParam(2025, 6, 0), "2025-07");

// Day counts, including February in a leap and a non-leap year.
const daysIn = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
assert.equal(daysIn(2024, 1), 29);
assert.equal(daysIn(2025, 1), 28);
assert.equal(daysIn(2025, 6), 31);

// Deadline wording is day-based, so a deadline later today still reads "today".
const today = new Date(2025, 6, 18, 9, 0);
assert.equal(deadlineLabel(new Date(2025, 6, 18, 23, 0), today), "Closes today");
assert.equal(deadlineLabel(new Date(2025, 6, 19, 1, 0), today), "Closes tomorrow");
assert.equal(deadlineLabel(new Date(2025, 6, 23), today), "Closes in 5 days");
assert.equal(deadlineLabel(new Date(2025, 6, 17), today), "Closed 1 day ago");

console.log("calendar math OK");
