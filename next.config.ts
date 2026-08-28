import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // File questions and CMS image fields submit through Server Actions. The
    // Next.js default is 1 MB, while registration forms allow files up to
    // 3 MB (and admins can upload several images in one form).
    serverActions: {
      bodySizeLimit: "10mb",
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
