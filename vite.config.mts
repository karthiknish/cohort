import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite'

const root = path.dirname(fileURLToPath(import.meta.url))

// Sentry Vite plugin only uploads source maps in production builds where
// SENTRY_AUTH_TOKEN is set. In dev the plugin is a no-op.
const isProduction = process.env.NODE_ENV === 'production'
const hasSentryAuthToken = !!process.env.SENTRY_AUTH_TOKEN

export default defineConfig({
  envPrefix: ['NEXT_PUBLIC_', 'VITE_'],
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
      '@/features': path.resolve(root, 'src/features'),
      '@/shared': path.resolve(root, 'src/shared'),
      '@convex': path.resolve(root, 'convex'),
      '/_generated': path.resolve(root, 'convex/_generated'),
    },
  },
  ssr: {
    noExternal: ['@convex-dev/better-auth'],
  },
  plugins: [
    // This project uses the `.client.*` suffix in the Next.js sense
    // ("Client Component" — still SSR-rendered as a route `component`),
    // not the TanStack Start sense ("client-only, forbidden on server").
    // Override the default server-env denial of `**/*.client.*` so route
    // files can import `page.client.tsx` modules. The `.server.*` client-env
    // denial is left intact — that's the rule that catches real server-only
    // leaks into the client bundle.
    tanstackStart({
      importProtection: {
        server: { files: [] },
      },
    }),
    // Source map upload + React component annotation + tunnel route.
    // Only active when SENTRY_AUTH_TOKEN is present (production builds).
    ...(isProduction && hasSentryAuthToken
      ? sentryTanstackStart({
          org: 'karthik-lq7',
          project: 'cohorts',
          // React component names in Sentry replays / breadcrumbs
          reactComponentAnnotation: { enabled: true },
          // Same-origin tunnel to bypass ad blockers
          tunnelRoute: true,
        })
      : []),
    nitro(),
    viteReact(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    // Source maps are required for Sentry to un-minify production stack traces.
    // 'hidden' = generates .map files but doesn't reference them in the output
    // (so browsers don't download them; Sentry uploads them separately).
    sourcemap: isProduction ? 'hidden' : true,
  },
  optimizeDeps: {
    exclude: ['@tanstack/react-start'],
  },
})
