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

  // Disable all automatic instrumentation to fix Next.js 16 compatibility
  disableAutoInstrumentation: true,

  // Disable source maps upload to avoid global-error.rsc issues
  sourcemaps: {
    disable: true,
  },

  // Disable Vercel Cron monitoring
  automaticVercelMonitors: false,
});
