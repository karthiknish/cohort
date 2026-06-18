import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { syncGoogleAnalyticsMetrics } from '@/services/integrations/google-analytics/sync'
import { ValidationError } from '@/lib/api-errors'

export const Route = createFileRoute('/api/analytics/google-analytics/sync')({
  server: {
    handlers: adaptApiHandler(
      {
        workspace: 'required',
        rateLimit: 'sensitive',
      },
      async (_req, { auth, workspace }) => {
        if (!auth.uid) {
          throw new ValidationError('User context is required')
        }
        if (!workspace) {
          throw new ValidationError('Workspace context is required')
        }
        return await syncGoogleAnalyticsMetrics({
          userId: auth.uid,
          clientId: null,
          days: 30,
          requestId: _req.headers.get('x-request-id'),
        })
      },
    ),
  },
})
