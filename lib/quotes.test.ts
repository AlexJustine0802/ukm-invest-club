/**
 * Run with: npx tsx lib/quotes.test.ts
 *
 * Guards the only non-obvious part: the index has to advance by exactly one a
 * day, wrap cleanly at the end of the list, and stay put within a single day.
 */
import assert from "node:assert/strict";
import { QUOTES, quoteOfTheDay } from "./quotes";

const morning = new Date(2026, 7, 10, 0, 5);
const evening = new Date(2026, 7, 10, 23, 55);
const nextDay = new Date(2026, 7, 11, 9, 0);

assert.equal(
  quoteOfTheDay(morning).text,
  quoteOfTheDay(evening).text,
  "the quote must not change during the day",
);
assert.notEqual(
  quoteOfTheDay(morning).text,
  quoteOfTheDay(nextDay).text,
  "the quote must change at midnight",
);

// A full cycle returns to the same quote, and every quote is used once.
const cycle = Array.from({ length: QUOTES.length }, (_, i) =>
  quoteOfTheDay(new Date(2026, 7, 10 + i)).text,
);
assert.equal(new Set(cycle).size, QUOTES.length, "every quote is used once");
assert.equal(
  quoteOfTheDay(new Date(2026, 7, 10 + QUOTES.length)).text,
  cycle[0],
  "the list wraps",
);

console.log("quotes: ok");
