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
  sectionsOf,
  flattenQuestions,
  parseQuestions as parse,
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

// Sections: the form splits on breaks, and a form without one is still a form.
const q = (id: string, type = "SHORT_TEXT") => ({
  id,
  type,
  label: id,
  required: false,
});
const sectioned = parse([q("a"), q("gap", "PAGE_BREAK"), q("b"), q("c")]);
const sections = sectionsOf(sectioned);
assert.equal(sections.length, 2);
assert.deepEqual(
  sections.map((s) => s.map((x) => x.id)),
  [["a"], ["b", "c"]],
);
assert.equal(sectionsOf(parse([q("a")])).length, 1, "no break = one section");
assert.equal(sectionsOf([]).length, 1, "empty form still has a page");
assert.equal(
  sectionsOf(parse([q("gap", "PAGE_BREAK"), q("gap2", "PAGE_BREAK"), q("a")]))
    .length,
  1,
  "empty sections are dropped, not shown as a blank page",
);

// Branches: kept on a dropdown, dropped anywhere else, and flattened for CSV.
const branching = parse([
  {
    id: "major",
    type: "DROPDOWN",
    label: "Major",
    required: true,
    options: ["Informatics", "Math"],
    branches: {
      Informatics: [q("lang")],
      Math: [q("proof")],
      Physics: [q("orphan")],
    },
  },
  { ...q("note"), branches: { anything: [q("nope")] } },
]);
assert.deepEqual(Object.keys(branching[0].branches ?? {}), [
  "Informatics",
  "Math",
  "Physics",
]);
assert.equal(branching[1].branches, undefined, "only a dropdown may branch");
assert.deepEqual(
  flattenQuestions(sectioned).map((x) => x.id),
  ["a", "b", "c"],
  "section breaks are not questions",
);
assert.deepEqual(
  flattenQuestions(branching).map((x) => x.id),
  ["major", "lang", "proof", "orphan", "note"],
  "branch answers get their own column",
);

// Nesting is bounded, so a hand-edited JSON column cannot recurse forever.
const deep = parse([
  {
    id: "l1",
    type: "DROPDOWN",
    label: "l1",
    required: false,
    options: ["x"],
    branches: {
      x: [
        {
          id: "l2",
          type: "DROPDOWN",
          label: "l2",
          required: false,
          options: ["y"],
          branches: {
            y: [
              {
                id: "l3",
                type: "DROPDOWN",
                label: "l3",
                required: false,
                options: ["z"],
                branches: { z: [q("l4")] },
              },
            ],
          },
        },
      ],
    },
  },
]);
assert.deepEqual(
  flattenQuestions(deep).map((x) => x.id),
  ["l1", "l2", "l3"],
  "past the depth limit branches are dropped",
);

console.log("forms OK");
