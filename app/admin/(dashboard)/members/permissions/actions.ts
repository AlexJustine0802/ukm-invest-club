"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/adminAccess";
import { parsePermissions, type PermissionMap } from "@/lib/permissions";
import { allRoles } from "@/lib/roles";

/**
 * Save one role's permission grid.
 *
 * The form posts one "perm" value per ticked box, shaped "module:action".
 * They are collected into a map and run through parsePermissions, which drops
 * anything that is not a real module/action pair and anything reserved to the
 * super admin  so a hand-crafted POST cannot grant what the grid does not
 * offer.
 */
export async function updateRolePermissions(formData: FormData) {
  await requireSuperAdmin();

  const role = ((formData.get("role") as string) ?? "").trim();
  // Only roles that exist in the org chart. A stale or invented role would
  // create a row nobody can ever match.
  if (!role || !allRoles().includes(role)) return;

  const draft: PermissionMap = {};
  for (const entry of formData.getAll("perm")) {
    const [moduleId, action] = String(entry).split(":");
    if (!moduleId || !action) continue;
    (draft[moduleId] ??= []).push(action as never);
  }

  const permissions = parsePermissions(draft);

  await prisma.rolePermission.upsert({
    where: { role },
    create: { role, permissions },
    update: { permissions },
  });

  // The member portal decides whether to show the Admin item from this, and
  // it is rendered in the layout, so the whole segment has to refresh.
  revalidatePath("/admin", "layout");
  revalidatePath("/account", "layout");
  redirect("/admin/members/permissions");
}
