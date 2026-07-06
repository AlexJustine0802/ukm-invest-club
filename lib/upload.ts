import { put } from "@vercel/blob";

/**
 * Upload an image file to Vercel Blob and return its public URL.
 * Throws a friendly error if the Blob token isn't configured, so callers can
 * fall back to a pasted image URL instead.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Image upload is not configured (BLOB_READ_WRITE_TOKEN missing). Paste an image URL instead.",
    );
  }
  const ext = file.name.split(".").pop() || "jpg";
  const key = `uploads/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;
  const blob = await put(key, file, { access: "public" });
  return blob.url;
}

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * Resolve the final image URL from a form: prefer an uploaded file, otherwise
 * use the pasted URL. Returns null when neither is provided.
 */
export async function resolveImage(
  file: File | null,
  pastedUrl: string | null,
): Promise<string | null> {
  if (file && file.size > 0) {
    return uploadImage(file);
  }
  const trimmed = pastedUrl?.trim();
  return trimmed ? trimmed : null;
}
