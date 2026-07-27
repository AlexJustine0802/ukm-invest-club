/**
 * Self-check for the registration form model  question parsing, audience
 * rules, open/closed windows and CSV quoting.
 *
 *   npx tsx scripts/check-forms.ts
 */
import assert from "node:assert/strict";
import {
  parseQuestions,
  parseAnswers,
  answerText,
  formStatus,
  allowsGuests,
  allowsMembers,
  toCsv,
  csvCell,
  MAX_MB_LIMIT,
} from "../lib/forms";

// Good questions survive; junk is dropped rather than crashing the page.
const parsed = parseQuestions([
  { id: "a", type: "SHORT_TEXT", label: "Name" },
  { id: "b", type: "CHECKBOX", label: "Divisions", options: ["Research", 7, "Media"], required: false },
  { id: "c", type: "FILE", label: "CV", maxMb: 99 },
  { id: "d", type: "NOT_A_TYPE", label: "Bad" },
  { id: "e", label: "No type" },
  "nonsense",
  null,
]);
assert.equal(parsed.length, 3);
assert.equal(parsed[0].required, true, "required defaults to true");
assert.deepEqual(parsed[1].options, ["Research", "Media"], "non-strings dropped");
assert.equal(parsed[1].required, false);
assert.equal(parsed[2].maxMb, MAX_MB_LIMIT, "maxMb capped at the hard limit");
assert.deepEqual(parseQuestions("not an array"), []);

// Answers: strings and string arrays only.
const answers = parseAnswers({ a: "Alex", b: ["Research", 3], c: { nope: 1 } });
assert.equal(answers.a, "Alex");
assert.deepEqual(answers.b, ["Research"]);
assert.equal(answers.c, undefined);
assert.equal(answerText(answers.b), "Research");
assert.equal(answerText(undefined), "");

// Audience gates.
assert.equal(allowsMembers("MEMBERS"), true);
assert.equal(allowsGuests("MEMBERS"), false);
assert.equal(allowsGuests("PUBLIC"), true);
assert.equal(allowsMembers("PUBLIC"), false);
assert.equal(allowsGuests("BOTH") && allowsMembers("BOTH"), true);

// Open / closed window.
const now = new Date(2026, 0, 15);
const win = (opensAt: Date | null, closesAt: Date | null, published = true) =>
  formStatus({ published, opensAt, closesAt }, now);
assert.equal(win(null, null), "open");
assert.equal(win(null, null, false), "hidden");
assert.equal(win(new Date(2026, 1, 1), null), "not-yet");
assert.equal(win(null, new Date(2026, 0, 1)), "closed");
assert.equal(win(new Date(2026, 0, 1), new Date(2026, 1, 1)), "open");

// CSV quoting: commas, quotes and newlines must not break the columns.
assert.equal(csvCell('He said "hi", loudly'), '"He said ""hi"", loudly"');
const csv = toCsv([
  ["Name", "Essay"],
  ["Alex", "line one\nline two"],
]);
assert.ok(csv.startsWith("﻿"), "BOM present for Excel/Sheets");
assert.ok(csv.includes('"line one\nline two"'));
assert.equal(csv.split("\r\n").length, 2, "newline inside a cell stays inside it");

console.log("forms OK");
