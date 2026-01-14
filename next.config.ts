import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    root: process.cwd(),
  },
  // Skip static generation entirely - use SSR for all pages
  // This fixes build errors with React 19 + Next.js 16 + Sentry
  experimental: {
    staticGenerationRetryCount: 0,
  },
  // Clean output directory before builds to prevent stale file issues
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

export default withSentryConfig(nextConfig, {
  org: "karthik-lq7",
  project: "cohorts",
  silent: !process.env.CI,

  // Disable source maps to avoid global-error.rsc build issues
  sourcemaps: {
    disable: true,
  },

  // Disable all webpack instrumentation
  webpack: {
    autoInstrumentAppDirectory: false,
    autoInstrumentServerFunctions: false,
    autoInstrumentMiddleware: false,
    disableSentryConfig: true,
  },
});
