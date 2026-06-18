import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { proxyAuthToConvex } = await import('@/lib/auth-server')
        return proxyAuthToConvex(request)
      },
      POST: async ({ request }) => {
        const { proxyAuthToConvex } = await import('@/lib/auth-server')
        return proxyAuthToConvex(request)
      },
    },
  },
})
