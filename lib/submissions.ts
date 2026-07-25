// Shared between the submission form and the server action. Kept out of the
// action file because a "use server" module may only export async functions.

/** Uploads are capped so one member cannot fill the blob store. */
export const MAX_SUBMISSION_MB = 10;

export const ALLOWED_SUBMISSION_EXTENSIONS = [
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  "csv", "zip", "png", "jpg", "jpeg",
];

/** `accept` attribute for the file input. */
export const SUBMISSION_ACCEPT = ALLOWED_SUBMISSION_EXTENSIONS.map(
  (e) => `.${e}`,
).join(",");

export interface SubmitState {
  error?: string;
  ok?: boolean;
}
