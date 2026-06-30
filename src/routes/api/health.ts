import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'

const handlers = adaptApiHandler(
  {
    auth: 'none',
    rateLimit: 'standard',
  },
  async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }),
)

export const Route = createFileRoute('/api/health')({
  server: {
    handlers,
  },
})
