import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // reactCompiler: true, // Temporarily disabled - causes build issues with _global-error
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    staticGenerationRetryCount: 2,
    optimizePackageImports: [
      'lucide-react',
      'date-fns',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'recharts'
    ],
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
