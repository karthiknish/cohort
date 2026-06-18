import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
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
