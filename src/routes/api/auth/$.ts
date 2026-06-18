import { createFileRoute } from '@tanstack/react-router'
import { proxyAuthToConvex } from '@/lib/auth-server'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => proxyAuthToConvex(request),
      POST: async ({ request }) => proxyAuthToConvex(request),
    },
  },
})
