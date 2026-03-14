import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@convex': path.resolve(__dirname, './convex'),
      '/_generated': path.resolve(__dirname, './convex/_generated'),
    },
  },
})
