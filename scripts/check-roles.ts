/**
 * Self-check for the org chart  the role/division pairing an admin POST is
 * validated against.
 *
 *   npx tsx scripts/check-roles.ts
 */
import assert from "node:assert/strict";
import {
  DIVISIONS,
  GENERAL_ROLES,
  rolesFor,
  isValidRole,
  divisionName,
  isHead,
  getDivision,
} from "../lib/roles";

assert.equal(DIVISIONS.length, 7);

// Slugs are the stored identity  a rename must never change them, or every
// member assigned to the old value is orphaned.
assert.deepEqual(
  DIVISIONS.map((d) => d.slug),
  [
    "pvpc",
    "finance-legality",
    "human-resource-development",
    "external-relationship",
    "creative-brand-marketing",
    "project-event",
    "research-development",
  ],
);

// The board is the only division without a Head.
const noHead = DIVISIONS.filter((d) => !d.hasHead).map((d) => d.slug);
assert.deepEqual(noHead, ["pvpc"]);
assert.deepEqual(rolesFor("pvpc"), ["President", "Vice President"]);
assert.ok(!rolesFor("pvpc").some(isHead), "the board has no Head role");

// Every other division offers its Head first, then its positions.
for (const d of DIVISIONS.filter((x) => x.hasHead)) {
  const roles = rolesFor(d.slug);
  assert.equal(roles[0], `Head of ${d.name}`, `${d.slug} head first`);
  assert.equal(roles.length, d.positions.length + 1);
}

// Unknown or missing division falls back to the general roles.
assert.deepEqual(rolesFor(null), GENERAL_ROLES);
assert.deepEqual(rolesFor("made-up"), GENERAL_ROLES);
assert.equal(getDivision("made-up"), null);
assert.equal(
  divisionName("human-resource-development"),
  "Human Resource Development",
);
assert.equal(divisionName(null), null);

// Validation: a role only counts inside its own division.
assert.equal(isValidRole("President", "pvpc"), true);
assert.equal(isValidRole("President", "finance-legality"), false);
assert.equal(isValidRole("Head of Finance & Legality", "finance-legality"), true);
assert.equal(
  isValidRole("Head of PVP", "pvpc"),
  false,
  "the board has no head",
);
assert.equal(isValidRole("Controller", "pvpc"), false, "Controller retired");
assert.equal(isValidRole("Investment Analyst", "research-development"), true);
assert.equal(
  isValidRole("Market Research & Collaboration", "external-relationship"),
  true,
);
assert.equal(
  isValidRole("Talent Performance & Acquisition", "human-resource-development"),
  true,
);
assert.equal(isValidRole("Investment Analyst", null), false);
assert.equal(isValidRole("Member", null), true);
assert.equal(isValidRole("Supreme Leader", "pvpc"), false);

console.log("roles OK");
