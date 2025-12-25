import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Cohorts - Marketing Agency Dashboard',
    short_name: 'Cohorts',
    description: 'Offline-capable client management and analytics for marketing agencies.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b1220',
    theme_color: '#0ea5e9',
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
}
