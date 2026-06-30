import { createFileRoute } from '@tanstack/react-router'

const manifest = {
  name: 'Cohorts - Marketing Agency Dashboard',
  short_name: 'Cohorts',
  description: 'Offline-capable client management and analytics for marketing agencies.',
  start_url: '/',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#ffffff',
  theme_color: '#ffffff',
  icons: [
    {
      src: '/cohorts-logo.png',
      sizes: '192x192',
      type: 'image/png',
    },
    {
      src: '/cohorts-logo.png',
      sizes: '512x512',
      type: 'image/png',
    },
    {
      src: '/logo_white.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'maskable',
    },
  ],
}
export const Route = createFileRoute('/manifest/webmanifest')({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(manifest), {
          headers: { 'content-type': 'application/manifest+json' },
        }),
    },
  },
})
