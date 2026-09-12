export { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from "@/lib/uploadLimits";

/** Whether the new Vercel Blob store is configured on the server. */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_NEW_READ_WRITE_TOKEN);
}

/**
 * Server actions persist URLs produced by the client upload flow. They do not
 * receive binary files and proxy them to a Function. Pasted URLs remain
 * supported for the existing CMS behavior.
 */
export async function resolveImage(
  file: File | null,
  pastedUrl: string | null,
): Promise<string | null> {
  const trimmed = pastedUrl?.trim();
  if (trimmed) return trimmed;

  // A binary file without a direct-upload URL is intentionally ignored. This
  // prevents old/forged form posts from reintroducing the Server Action proxy.
  if (file && file.size > 0) return null;
  return null;
}
