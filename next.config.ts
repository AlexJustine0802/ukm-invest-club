import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // File questions and CMS image fields submit through Server Actions. The
    // Keep this above the per-file 10 MB limit to allow multipart overhead and
    // forms that contain more than one uploaded file.
    serverActions: {
      bodySizeLimit: "25mb",
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
