"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getUserSession } from "@/lib/userAuth";
import { issueAuthToken, siteUrl } from "@/lib/authTokens";
import { sendAuthEmail } from "@/lib/email";
import { uploadImage } from "@/lib/upload";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/upload";

export interface ProfileState {
  error?: string;
  saved?: boolean;
  sent?: boolean;
}

/**
 * Only http(s) links are stored. A profile link is rendered as an anchor for
 * every other member, so `javascript:` and friends must never reach the page.
 */
function cleanLink(value: string | null): string | null {
  const url = value?.trim();
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
}

/** Instagram and LinkedIn on the member's own profile. */
export async function updateMySocials(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await getUserSession();
  if (!session) return { error: "Please sign in again." };

  const str = (key: string) => (formData.get(key) as string)?.trim() || null;
  const instagram = str("instagram");
  const linkedin = str("linkedin");

  if (instagram && !cleanLink(instagram)) {
    return { error: "Instagram must be a full https:// link." };
  }
  if (linkedin && !cleanLink(linkedin)) {
    return { error: "LinkedIn must be a full https:// link." };
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { instagram: cleanLink(instagram), linkedin: cleanLink(linkedin) },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account/members");
  // The public About page builds its people from these accounts.
  revalidatePath("/about");
  return { saved: true };
}

/** Same ceiling the browser cannot be trusted to enforce. */
const MAX_PHOTO_BYTES = MAX_UPLOAD_BYTES;

/**
 * The member's own profile picture.
 *
 * Submitting with no file and `remove` set clears it; the old blob is left in
 * place rather than deleted, which is what every other image in the CMS does.
 */
export async function updateMyPhoto(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await getUserSession();
  if (!session) return { error: "Please sign in again." };

  if (formData.get("remove") === "1") {
    await prisma.user.update({
      where: { id: session.userId },
      data: { photo: null },
    });
    revalidateProfile();
    return { saved: true };
  }

  const file = formData.get("photoFile");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image first." };
  }
  // Both checks run on the server: the `accept` attribute and any client-side
  // size check are hints, not limits.
  if (!file.type.startsWith("image/")) {
    return { error: "That file is not an image." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { error: `Image must be ${MAX_UPLOAD_MB} MB or smaller.` };
  }

  let url: string;
  try {
    url = await uploadImage(file);
  } catch {
    return { error: "Upload failed. Please try again." };
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { photo: url },
  });

  revalidateProfile();
  return { saved: true };
}

/** Everywhere a member's photo is rendered. */
function revalidateProfile() {
  revalidatePath("/account/profile");
  revalidatePath("/account/members");
  revalidatePath("/about");
}

/**
 * Email the signed-in member a link that confirms their address.
 *
 * The address is taken from their session, never from the form: this proves an
 * address someone already has, it does not let them claim a different one.
 */
export async function requestEmailVerification(): Promise<ProfileState> {
  const session = await getUserSession();
  if (!session) return { error: "Please sign in again." };

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { email: true, emailVerified: true },
  });
  if (!user) return { error: "Please sign in again." };
  if (user.emailVerified) return { saved: true };

  const token = await issueAuthToken(session.userId, "VERIFY");
  await sendAuthEmail(
    user.email,
    "verify",
    `${siteUrl()}/verify-email?token=${token}`,
  );

  return { sent: true };
}
