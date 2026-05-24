import { createApiHandler } from '@/lib/api-handler'

/** Public liveness probe — no secrets or dependency metadata. */
export const GET = createApiHandler(
  {
    auth: 'none',
    rateLimit: 'standard',
  },
  async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }),
)
