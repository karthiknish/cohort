import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    staticGenerationRetryCount: 0,
    // Explicitly disable Partial Prerendering (PPR).
    // This avoids Vercel builds expecting `_global-error.rsc`.
    ppr: false,
  },
  cleanDistDir: true,
  async rewrites() {
    return [
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
};

export default nextConfig;
