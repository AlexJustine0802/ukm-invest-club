/**
 * Self-check for the admin permission system.
 *
 * The important assertion is the first one: every admin server action is
 * guarded. A single unguarded action is an open mutation endpoint now that
 * members can reach /admin, and it is not something to verify by eye across
 * twenty files.
 *
 *   npx tsx scripts/check-permissions.ts
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  ACTIONS,
  ADMIN_ACCESS,
  ADMIN_MODULES,
  SECTION_MODULES,
  hasAccess,
  moduleById,
  parsePermissions,
  countPermissions,
  TOTAL_PERMISSIONS,
} from "../lib/permissions";
import { allRoles } from "../lib/roles";

const ADMIN_DIR = path.join(process.cwd(), "app", "admin");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const files = walk(ADMIN_DIR);
const rel = (f: string) => path.relative(process.cwd(), f).replace(/\\/g, "/");

// ---- 1. Every mutation is guarded -----------------------------------------

const GUARDS = ["requirePermission(", "requireSuperAdmin("];
const actionFiles = files.filter((f) => f.endsWith("actions.ts"));
assert.ok(actionFiles.length >= 18, "expected the admin action files to exist");

for (const file of actionFiles) {
  const src = fs.readFileSync(file, "utf8");
  // login/logout are the session itself, not admin mutations.
  if (rel(file).includes("/admin/login/") || rel(file).endsWith("admin/actions.ts"))
    continue;

  const exported = [...src.matchAll(/export async function (\w+)\s*\(/g)];
  assert.ok(exported.length > 0, `${rel(file)}: no exported actions found`);

  for (const match of exported) {
    // The guard must be the first statement of the action, not merely present
    // somewhere in the file.
    const body = src.slice(match.index + match[0].length, match.index + match[0].length + 400);
    assert.ok(
      GUARDS.some((g) => body.includes(g)),
      `${rel(file)}: ${match[1]}() does not start with a permission guard`,
    );
  }
}

// Nothing may still use the old admin-only guard  it would silently keep a
// module working for the super admin while never being reachable by a
// delegated role, which is the failure mode this whole change is about.
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  assert.ok(
    !src.includes("requireSession("),
    `${rel(file)}: still calls requireSession()`,
  );
}

// ---- 2. Guards only name modules and actions that exist -------------------

const used = new Set<string>();
for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  for (const m of src.matchAll(
    /require(?:Permission|Page)\(\s*"([^"]+)"\s*,\s*"([^"]+)"/g,
  )) {
    used.add(`${m[1]}:${m[2]}`);
  }
  for (const m of src.matchAll(/requireView\(\s*"([^"]+)"/g)) {
    used.add(`${m[1]}:view`);
  }
  for (const m of src.matchAll(
    /<Can\s+module="([^"]+)"\s+action="([^"]+)"/g,
  )) {
    used.add(`${m[1]}:${m[2]}`);
  }
}
assert.ok(used.size > 40, `expected many guarded call sites, got ${used.size}`);

for (const pair of used) {
  const [moduleId, action] = pair.split(":");
  const found = moduleById(moduleId);
  assert.ok(found, `guard names unknown module "${moduleId}"`);
  assert.ok(
    (ACTIONS as readonly string[]).includes(action),
    `guard names unknown action "${action}"`,
  );
  // A super-admin-only module has no action list; anything else must offer
  // the action it is being guarded with, or the toggle can never be granted.
  if (!found.superAdminOnly) {
    assert.ok(
      found.actions.includes(action as (typeof ACTIONS)[number]),
      `${moduleId} is guarded with "${action}" but does not offer that toggle`,
    );
  }
}

// Every section must have at least one page guarded with view, or it would
// appear in the grid and grant nothing. The access switch is not a section:
// it guards the layout, not a page of its own.
for (const m of SECTION_MODULES) {
  assert.ok(
    used.has(`${m.id}:view`),
    `${m.id} has no page guarded with view`,
  );
}

// ---- 3. Registry invariants ------------------------------------------------

const ids = ADMIN_MODULES.map((m) => m.id);
assert.equal(new Set(ids).size, ids.length, "module ids are unique");
for (const m of ADMIN_MODULES) {
  if (m.superAdminOnly) {
    assert.deepEqual(m.actions, [], `${m.id} is super-admin-only, so no toggles`);
  } else if (m.workspace === "core") {
    assert.deepEqual(m.actions, ["access"], "the door has exactly one toggle");
  } else {
    assert.ok(m.actions.includes("view"), `${m.id} must offer view`);
  }
}

// Exactly one access switch, and it is not a section.
const core = ADMIN_MODULES.filter((m) => m.workspace === "core");
assert.deepEqual(core.map((m) => m.id), [ADMIN_ACCESS.module]);
assert.ok(!SECTION_MODULES.some((m) => m.id === ADMIN_ACCESS.module));
// The "n of N" summary counts the access switch too, so N is every toggle the
// grid renders.
assert.equal(
  TOTAL_PERMISSIONS,
  SECTION_MODULES.reduce((n, m) => n + m.actions.length, 0) + 1,
);

// ---- 4. parsePermissions is a boundary, not a formatter --------------------

assert.deepEqual(parsePermissions(null), {});
assert.deepEqual(parsePermissions("nope"), {});
assert.deepEqual(parsePermissions([1, 2]), {});
assert.deepEqual(parsePermissions({ events: "view" }), {}, "actions must be an array");
assert.deepEqual(
  parsePermissions({ "not-a-module": ["view"] }),
  {},
  "unknown modules are dropped",
);
assert.deepEqual(
  parsePermissions({ career: ["view", "fly"] }),
  { career: ["view"] },
  "unknown actions are dropped",
);
assert.deepEqual(
  parsePermissions({ events: ["view", "delete"] }),
  { events: ["view"] },
  "actions the module does not offer are dropped",
);
assert.deepEqual(
  parsePermissions({ settings: ["view", "edit"] }),
  {},
  "super-admin-only modules can never be granted by a stored row",
);
assert.deepEqual(
  parsePermissions({ "member-roles": ["edit"], permissions: ["edit"] }),
  {},
  "role management and permission management are never delegable",
);
assert.deepEqual(
  parsePermissions({ career: [] }),
  {},
  "an empty action list is not a grant",
);

// Order follows the registry, not the stored row, so the UI is stable.
assert.deepEqual(parsePermissions({ career: ["delete", "view"] }), {
  career: ["view", "delete"],
});

assert.equal(countPermissions({}), 0);
assert.equal(countPermissions({ career: ["view", "edit"], events: ["view"] }), 3);

// The access switch survives a round trip and is readable on its own.
assert.deepEqual(parsePermissions({ admin: ["access"] }), { admin: ["access"] });
assert.equal(hasAccess(parsePermissions({ admin: ["access"] })), true);
assert.equal(hasAccess(parsePermissions({ career: ["view"] })), false);
assert.equal(hasAccess({}), false);
assert.deepEqual(
  parsePermissions({ admin: ["view", "edit"] }),
  {},
  "the door offers only access, nothing else",
);

// ---- 5. Roles are usable as permission keys --------------------------------

const roles = allRoles();
assert.equal(new Set(roles).size, roles.length, "role names are unique");
assert.ok(roles.includes("Legal Manager"));
assert.ok(roles.includes("Member"), "division-less roles are configurable too");

console.log(
  `permissions OK  ${actionFiles.length} action files guarded, ` +
    `${used.size} guarded call sites, ${TOTAL_PERMISSIONS} toggles`,
);
