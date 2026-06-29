import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { sentryTanstackStart } from '@sentry/tanstackstart-react/vite'

const root = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

function publicEnvDefine(mode: string): Record<string, string> {
  const env = { ...loadEnv(mode, root, ''), ...process.env }
  const define: Record<string, string> = {}
  for (const [key, value] of Object.entries(env)) {
    if (
      (key.startsWith('NEXT_PUBLIC_') || key.startsWith('VITE_')) &&
      typeof value === 'string' &&
      value.length > 0
    ) {
      define[`process.env.${key}`] = JSON.stringify(value)
    }
  }
  return define
}

/**
 * TanStack Start Vite config.
 *
 * `tanstackStart()` MUST come before `viteReact()`. Path aliases mirror
 * `tsconfig.json` `paths`.
 */
export default defineConfig(({ mode }) => ({
  envPrefix: ['NEXT_PUBLIC_', 'VITE_'],
  define: publicEnvDefine(mode),
  resolve: {
    alias: {
      '@': path.resolve(root, 'src'),
      '@/features': path.resolve(root, 'src/features'),
      '@/shared': path.resolve(root, 'src/shared'),
      '@convex': path.resolve(root, 'convex'),
      '/_generated': path.resolve(root, 'convex/_generated'),
    },
  },
  plugins: [
    tanstackStart({
      react: {
        babel: {
          plugins: [['babel-plugin-react-compiler', { target: '19' }]],
        },
      },
      // Route files legitimately import .server.ts modules for beforeLoad
      // callbacks that run on the server during SSR.
      importProtection: {
        exclude: [/\/routes\//],
      },
    }),
    // Nitro handles the production server build. On Vercel it auto-detects
    // the `VERCEL` environment and emits `.vercel/output` (Build Output API),
    // which Vercel deploys directly. Locally / for `start:start` it emits a
    // Node server under `.output/`.
    nitro(),
    viteReact(),
    tailwindcss(),
    // Sentry plugin must be last — manages source map uploads + Nitro tracing
    sentryTanstackStart({
      org: 'karthik-lq7',
      project: 'cohorts',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      // Only upload source maps in production builds with an auth token
      disable: !isProduction || !process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    // Enable sourcemaps in production so the Sentry Vite plugin can upload
    // them. The plugin deletes the .map files from the build output after
    // upload, so they are not shipped to clients.
    sourcemap: true,
  },
  optimizeDeps: {
    exclude: ['@tanstack/react-start'],
  },
}))
