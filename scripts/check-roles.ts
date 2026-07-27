/**
 * Self-check for the org chart  the role/division pairing an admin POST is
 * validated against, and the four levels an RBAC layer keys off.
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
  roleLevel,
  outranks,
  reportsTo,
  headTitle,
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

// The board is the executive: no Head, no Manager, no Staff.
const executive = DIVISIONS.filter((d) => d.structure === "EXECUTIVE");
assert.deepEqual(
  executive.map((d) => d.slug),
  ["pvpc"],
);
assert.deepEqual(rolesFor("pvpc"), ["President", "Vice President"]);
assert.ok(!rolesFor("pvpc").some(isHead), "the board has no Head role");
assert.ok(
  !rolesFor("pvpc").some((r) => /( Manager| Staff)$/.test(r)),
  "the board has no manager or staff tier",
);

// Project & Event is one operational division: Head + Staff, no managers.
assert.deepEqual(rolesFor("project-event"), [
  "Head of Project & Event",
  "Project & Event Staff",
]);

// Every other division: exactly one Head, then a Manager and a Staff per unit.
for (const d of DIVISIONS.filter(
  (x) => x.structure === "HEAD_MANAGER_STAFF",
)) {
  const roles = rolesFor(d.slug);
  assert.equal(roles[0], `Head of ${d.name}`, `${d.slug} head first`);
  assert.equal(roles.filter(isHead).length, 1, `${d.slug} has one head`);
  assert.equal(roles.length, d.units.length * 2 + 1);
  for (const unit of d.units) {
    assert.ok(roles.includes(`${unit} Manager`), `${unit} Manager`);
    assert.ok(roles.includes(`${unit} Staff`), `${unit} Staff`);
  }
  // Managers all sit above staff, so the dropdown reads top-down.
  const firstStaff = roles.findIndex((r) => r.endsWith(" Staff"));
  const lastManager = roles.map((r) => r.endsWith(" Manager")).lastIndexOf(true);
  assert.ok(lastManager < firstStaff, `${d.slug} managers before staff`);
}

assert.deepEqual(rolesFor("finance-legality"), [
  "Head of Finance & Legality",
  "Legal Manager",
  "Finance Manager",
  "Legal Staff",
  "Finance Staff",
]);

// No role name may repeat across the whole chart, or roleLevel and the admin
// dropdown would be ambiguous.
const all = DIVISIONS.flatMap((d) => rolesFor(d.slug));
assert.equal(new Set(all).size, all.length, "role names are unique");

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
assert.equal(
  isValidRole("Head of Finance & Legality", "finance-legality"),
  true,
);
assert.equal(isValidRole("Head of PVP", "pvpc"), false, "the board has no head");
assert.equal(isValidRole("Controller", "pvpc"), false, "Controller retired");
assert.equal(isValidRole("Legal Manager", "finance-legality"), true);
assert.equal(isValidRole("Legal Staff", "finance-legality"), true);
assert.equal(
  isValidRole("Project & Event Manager", "project-event"),
  false,
  "Project & Event has no manager tier",
);
assert.equal(
  isValidRole("Investment Analyst", "research-development"),
  false,
  "bare unit names are not roles any more",
);
assert.equal(
  isValidRole("Investment Analyst Manager", "research-development"),
  true,
);
assert.equal(
  isValidRole("Media Relations Staff", "external-relationship"),
  true,
);
assert.equal(isValidRole("Investment Analyst Staff", null), false);
assert.equal(isValidRole("Member", null), true);
assert.equal(isValidRole("Supreme Leader", "pvpc"), false);

// Levels: what an RBAC layer attaches permissions to.
assert.equal(roleLevel("President"), "EXECUTIVE");
assert.equal(roleLevel("Vice President"), "EXECUTIVE");
assert.equal(roleLevel("Head of Research & Development"), "HEAD");
assert.equal(roleLevel("Website Development Manager"), "MANAGER");
assert.equal(roleLevel("Website Development Staff"), "STAFF");
assert.equal(roleLevel("Member"), "GENERAL");
assert.equal(roleLevel("Alumni"), "GENERAL");
for (const d of DIVISIONS) {
  for (const role of rolesFor(d.slug)) {
    assert.notEqual(
      roleLevel(role),
      "GENERAL",
      `${role} must sit on a real rung`,
    );
  }
}

assert.equal(outranks("President", "Head of Finance & Legality"), true);
assert.equal(outranks("Legal Manager", "Legal Staff"), true);
assert.equal(outranks("Legal Staff", "Legal Manager"), false);
assert.equal(outranks("Legal Manager", "Finance Manager"), false, "same rung");

// Reporting lines: managers to their head, staff to their own manager.
assert.equal(reportsTo("President", "pvpc"), null);
assert.equal(reportsTo("Vice President", "pvpc"), "President");
assert.equal(reportsTo("Head of Finance & Legality", "finance-legality"), "President");
assert.equal(
  reportsTo("Legal Manager", "finance-legality"),
  "Head of Finance & Legality",
);
assert.equal(reportsTo("Legal Staff", "finance-legality"), "Legal Manager");
assert.equal(
  reportsTo("Finance Staff", "finance-legality"),
  "Finance Manager",
  "staff follow their own unit, not the first one",
);
assert.equal(
  reportsTo("Project & Event Staff", "project-event"),
  "Head of Project & Event",
  "no manager tier: staff report to the head",
);
assert.equal(reportsTo("Member", null), null);

// Every role has an unbroken line to the President.
for (const d of DIVISIONS) {
  for (const role of rolesFor(d.slug)) {
    let current: string | null = role;
    const seen = new Set<string>();
    for (let hops = 0; current && hops <= 5; hops++) {
      assert.ok(!seen.has(current), `${role} loops at ${current}`);
      seen.add(current);
      current = reportsTo(current, d.slug);
    }
    assert.equal(current, null, `${role} reaches the top`);
    assert.ok(
      role === "President" || seen.has("President"),
      `${role} reports up to the President`,
    );
  }
}

// Heads are exactly one per division and named after it.
for (const d of DIVISIONS.filter((x) => x.structure !== "EXECUTIVE")) {
  assert.ok(rolesFor(d.slug).includes(headTitle(d)));
}

console.log("roles OK");
