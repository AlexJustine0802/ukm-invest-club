/** Shared limit; MB means 1024 * 1024 bytes throughout the app. */
const configuredMb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? "5");
export const MAX_UPLOAD_MB = 
  Number.isFinite(configuredMb) && configuredMb > 0 ? configuredMb : 5;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;
