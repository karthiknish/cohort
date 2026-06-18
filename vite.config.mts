import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const root = path.dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'

/**
 * TanStack Start Vite config.
 *
 * `tanstackStart()` MUST come before `viteReact()`. Path aliases mirror
 * `tsconfig.json` `paths`.
 */
export default defineConfig({
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
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
    sourcemap: !isProduction,
  },
  optimizeDeps: {
    exclude: ['@tanstack/react-start'],
  },
})
