/** Keep user-controlled names from becoming path segments in Blob keys. */
export function safeUploadName(name: string): string {
  return name.split(/[\\\\/]/).pop()?.replace(/[^a-zA-Z0-9._-]/g, "-") || "upload";
}
