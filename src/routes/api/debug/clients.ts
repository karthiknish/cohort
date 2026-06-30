import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { assertDebugIntrospectionEnabled } from '@/lib/debug-introspection'
import { debugApi } from '@/lib/convex-api'
import { ConvexHttpClient } from 'convex/browser'

const querySchema = z.object({
  mode: z.enum(['count', 'list', 'whoami']).default('count'),
  limit: z
    .string()
    .optional()
    .default('200')
    .transform((val) => {
      const num = parseInt(val, 10)
      if (!Number.isFinite(num) || num < 1) return 200
      return Math.min(num, 1000)
    }),
})

const handlers = adaptApiHandler(
  { auth: 'required', adminOnly: true, querySchema, rateLimit: 'standard' },
  async (_req, { query }) => {
    assertDebugIntrospectionEnabled()
    const { mode, limit } = query
    const convexUrl = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
    if (!convexUrl) {
      return { success: false, error: 'Convex not configured', code: 'CONFIG_ERROR' }
    }

    const { getToken } = await import('@/lib/auth-server')
    const convexToken = await getToken()
    if (!convexToken) {
      return { success: false, error: 'No Convex token available', code: 'AUTH_ERROR' }
    }

    const convex = new ConvexHttpClient(convexUrl)
    convex.setAuth(convexToken)

    const whoami = await convex.query(debugApi.whoami, {})

    if (mode === 'whoami') {
      return { whoami }
    }

    if (mode === 'list') {
      const rows = await convex.query(debugApi.listAnyClients, { limit })
      return { whoami, rows, count: rows.length }
    }

    const result = await convex.query(debugApi.countClientsByWorkspace, { limit })
    return { whoami, result }
  },
)

export const Route = createFileRoute('/api/debug/clients')({
  server: { handlers },
})
