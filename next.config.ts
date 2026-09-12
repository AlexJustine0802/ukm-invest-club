import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Non-secret UX setting; the Blob token is never exposed to the client.
    MAX_UPLOAD_SIZE_MB: process.env.MAX_UPLOAD_SIZE_MB ?? "5",
  },
  experimental: {
    // File questions and CMS image fields submit through Server Actions. The
    // Keep this above the per-file 5 MB limit to allow multipart overhead and
    // forms that contain more than one uploaded file.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
