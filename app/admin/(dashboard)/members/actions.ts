"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { resolveImage } from "@/lib/upload";
import { getDivision, isValidRole, GENERAL_ROLES } from "@/lib/roles";

/**
 * A member record shows up in the member area AND in "Our Divisions" on the
 * public About page, so every write here refreshes both.
 */
function revalidateMember() {
  revalidatePath("/admin/members");
  revalidatePath("/account/members");
  revalidatePath("/account", "layout"); // the role shows in every top bar
  revalidatePath("/about"); // public divisions
}

/**
 * Move a member to a division and role. The pair is validated against the org
 * chart in lib/roles.ts, so a hand-crafted POST cannot write a role that does
 * not exist or a role that belongs to another division.
 */
export async function updateMemberRole(formData: FormData) {
  await requireSession();

  const id = formData.get("id") as string;
  const role = ((formData.get("role") as string) ?? "").trim();
  const rawDivision = ((formData.get("division") as string) ?? "").trim();
  if (!id || !role) return;

  const division = rawDivision && getDivision(rawDivision) ? rawDivision : null;
  if (!isValidRole(role, division)) return;

  await prisma.user.update({
    where: { id },
    data: { role, division },
  });

  revalidateMember();
}

/**
 * Full profile edit: identity, division/role, and the public-facing bits shown
 * on the About page. One record, one place to change it.
 */
export async function updateMemberProfile(formData: FormData) {
  await requireSession();

  const id = formData.get("id") as string;
  if (!id) return;

  const str = (key: string) => (formData.get(key) as string)?.trim() || null;
  const name = ((formData.get("name") as string) ?? "").trim();
  const role = ((formData.get("role") as string) ?? "").trim();
  const rawDivision = ((formData.get("division") as string) ?? "").trim();
  const division = rawDivision && getDivision(rawDivision) ? rawDivision : null;

  if (!name || !isValidRole(role, division)) return;

  await prisma.user.update({
    where: { id },
    data: {
      name,
      role,
      division,
      photo: await resolveImage(
        formData.get("photoFile") as File | null,
        str("photo"),
      ),
      bio: str("bio"),
      instagram: str("instagram"),
      linkedin: str("linkedin"),
    },
  });

  revalidateMember();
  redirect("/admin/members");
}

/** Reset someone to a plain member with no division. */
export async function clearMemberRole(formData: FormData) {
  await requireSession();
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.user.update({
    where: { id },
    data: { role: GENERAL_ROLES[0], division: null },
  });

  revalidateMember();
}
