// Who is using the admin workspace, and what they may do there.
//
// There are two kinds of administrator:
//
//   super   the shared credential in lib/auth.ts. One person, full access to
//           everything, including the parts that are never delegable.
//   member  a signed-in member whose role has been granted permissions in
//           Permission Management. Sees the same pages inside the member
//           portal chrome, limited to what their role allows.
//
// Every admin page and every admin server action goes through this module, so
// there is exactly one answer to "may this request do this" rather than a
// scattering of session checks.

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { getSession } from "@/lib/auth";
import { getCurrentMember } from "@/lib/currentUser";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_ACCESS,
  ADMIN_MODULES,
  hasAccess,
  moduleById,
  parsePermissions,
  type Action,
  type AdminModule,
  type PermissionMap,
} from "@/lib/permissions";

export type AdminActor =
  | { kind: "super" }
  | { kind: "member"; user: User; permissions: PermissionMap };

/**
 * The current actor, or null when nobody is signed in either way.
 *
 * Cached per request for the same reason getCurrentMember is (see the note in
 * lib/currentUser.ts): the layout, the page and every <Can> on it all ask, and
 * the Supabase connection pool is small.
 *
 * A member with no permissions is still returned as a member actor  callers
 * decide what to do with an empty list, which is what lets the layout send
 * them back to /account instead of to a login page they are already past.
 */
export const getAdminActor = cache(async function getAdminActor(): Promise<
  AdminActor | null
> {
  // The shared credential wins: it is the only way into the super-admin-only
  // modules, and checking it first costs nothing (cookie + JWT verify).
  if (await getSession()) return { kind: "super" };
  return getMemberActor();
});

/**
 * The signed-in member and what their role allows, ignoring the super-admin
 * cookie entirely.
 *
 * Kept separate because both cookies can be present in one browser: signing
 * into /admin does not sign you in as the member whose portal is on screen,
 * and the portal's own chrome must answer for that member alone.
 */
const getMemberActor = cache(async function getMemberActor(): Promise<
  (AdminActor & { kind: "member" }) | null
> {
  const user = await getCurrentMember();
  if (!user) return null;

  const row = await prisma.rolePermission.findUnique({
    where: { role: user.role },
    select: { permissions: true },
  });

  return { kind: "member", user, permissions: parsePermissions(row?.permissions) };
});

export async function isSuperAdmin(): Promise<boolean> {
  return (await getAdminActor())?.kind === "super";
}

/** Whether the current actor may perform one action on one module. */
export async function can(moduleId: string, action: Action): Promise<boolean> {
  const actor = await getAdminActor();
  if (!actor) return false;
  if (actor.kind === "super") return true;

  const found = moduleById(moduleId);
  // Unknown module: deny. A typo in a guard must fail closed, not open.
  if (!found) return false;
  // Never delegable, whatever the stored row says. parsePermissions already
  // drops these; this is the second lock on the same door.
  if (found.superAdminOnly) return false;

  // admin.access is the door. Without it a role's module toggles are inert,
  // so revoking that one permission shuts the whole workspace for the role
  // without touching the rest of its grid.
  if (moduleId !== ADMIN_ACCESS.module && !hasAccess(actor.permissions)) {
    return false;
  }

  return actor.permissions[moduleId]?.includes(action) ?? false;
}

/**
 * Guard for server actions. Throws, because a mutation arriving without the
 * right permission is not a navigation mistake  it is a request that should
 * never have been made, and the caller's UI already hid the button.
 */
export async function requirePermission(
  moduleId: string,
  action: Action,
): Promise<AdminActor> {
  const actor = await getAdminActor();
  if (!actor || !(await can(moduleId, action))) {
    throw new Error(`Unauthorized: ${action} on ${moduleId} is not permitted`);
  }
  return actor;
}

/**
 * Guard for pages. Redirects rather than throwing: someone following a stale
 * link or typing a URL should land somewhere useful, not on an error page.
 *
 * Create and edit *pages* are guarded too, not just the buttons that link to
 * them  hiding the button leaves the URL reachable.
 */
export async function requirePage(
  moduleId: string,
  action: Action,
): Promise<AdminActor> {
  const actor = await getAdminActor();
  if (!actor) redirect("/admin/login");
  if (!(await can(moduleId, action))) redirect("/admin");
  return actor;
}

export function requireView(moduleId: string): Promise<AdminActor> {
  return requirePage(moduleId, "view");
}

/** Page-level version of requireSuperAdmin: redirects instead of throwing. */
export async function requireSuperAdminPage(): Promise<void> {
  if (!(await isSuperAdmin())) redirect("/admin");
}

/** Guard for the parts reserved to the shared credential. */
export async function requireSuperAdmin(): Promise<AdminActor> {
  const actor = await getAdminActor();
  if (actor?.kind !== "super") {
    throw new Error("Unauthorized: super admin session required");
  }
  return actor;
}

/**
 * Modules the current actor may open, in registry order. Drives the sidebar,
 * the division admin dashboard, and whether the Admin item appears in the
 * member portal at all.
 *
 * "May open" means view: a module whose list page is invisible cannot usefully
 * offer its other actions.
 */
export const allowedModules = cache(async function allowedModules(): Promise<
  AdminModule[]
> {
  const actor = await getAdminActor();
  if (!actor) return [];
  if (actor.kind === "super") {
    return ADMIN_MODULES.filter((m) => m.workspace !== "core");
  }
  return modulesFor(actor.permissions);
});

/**
 * Sections this permission map can open. "core" is excluded: admin.access is
 * the door, not a section, so it never appears as a shortcut card.
 */
function modulesFor(permissions: PermissionMap): AdminModule[] {
  if (!hasAccess(permissions)) return [];
  return ADMIN_MODULES.filter(
    (m) =>
      !m.superAdminOnly &&
      m.workspace !== "core" &&
      permissions[m.id]?.includes("view"),
  );
}

/**
 * Whether to show the Admin entry in the member portal sidebar.
 *
 * Answers for the signed-in member only. A super admin who happens to be
 * looking at someone's portal in the same browser must not see an Admin item
 * that member has not been granted  it would appear for every account they
 * sign into, and it is not that member's menu to have.
 */
export async function hasAdminAccess(): Promise<boolean> {
  const member = await getMemberActor();
  return member ? hasAccess(member.permissions) : false;
}
