import type { NextConfig } from 'next'

const isProduction = process.env.NODE_ENV === 'production'

function buildContentSecurityPolicy() {
  const directives = [
    ["default-src", ["'self'"]],
    ["base-uri", ["'self'"]],
    ["form-action", ["'self'"]],
    ["frame-ancestors", ["'none'"]],
    ["object-src", ["'none'"]],
    [
      "script-src",
      ["'self'", "'unsafe-inline'", ...(isProduction ? [] : ["'unsafe-eval'"]), 'https://us.i.posthog.com'],
    ],
    ["style-src", ["'self'", "'unsafe-inline'", 'https:']],
    ["img-src", ["'self'", 'data:', 'blob:', 'https:']],
    ["font-src", ["'self'", 'data:', 'https:']],
    ["connect-src", ["'self'", 'https:', 'wss:', 'blob:']],
    ["media-src", ["'self'", 'blob:', 'data:', 'https:']],
    [
      "frame-src",
      [
        "'self'",
        'https://accounts.google.com',
        'https://*.google.com',
        'https://www.facebook.com',
        'https://*.facebook.com',
        'https://*.linkedin.com',
        'https://*.tiktok.com',
      ],
    ],
    ["worker-src", ["'self'", 'blob:']],
  ]

  return directives.map(([name, values]) => `${name} ${values.join(' ')}`).join('; ')
}

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: buildContentSecurityPolicy(),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(self), geolocation=(self), fullscreen=(self)',
  },
  ...(isProduction
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
      ]
    : []),
] satisfies NonNullable<Awaited<ReturnType<NonNullable<NextConfig['headers']>>>[number]>['headers']

const nextConfig: NextConfig = {
  // reactCompiler: true, // Temporarily disabled - causes build issues with _global-error
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.convex.cloud',
        pathname: '/api/storage/**',
      },
    ],
  },
  logging: {
    browserToTerminal: !isProduction,
  },
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    viewTransition: true,
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
      'recharts',
    ],
  },
  cleanDistDir: true,
  async redirects() {
    return [
      {
        source: '/dashboard/activity',
        destination: '/dashboard/for-you',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
