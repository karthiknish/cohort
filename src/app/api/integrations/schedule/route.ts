import { z } from 'zod'
import { scheduleIntegrationSync, scheduleSyncsForAllUsers, scheduleSyncsForUser } from '@/lib/integration-auto-sync'
import { createApiHandler } from '@/lib/api-handler'

const scheduleSchema = z.object({
  force: z.boolean().optional(),
  providerIds: z.array(z.string()).optional(),
  providerId: z.string().optional(),
  allUsers: z.boolean().optional(),
  userId: z.string().optional(),
})

const scheduleQuerySchema = z.object({
  userId: z.string().optional(),
})

export const POST = createApiHandler(
  {
    bodySchema: scheduleSchema,
    querySchema: scheduleQuerySchema,
  },
  async (req, { auth, body, query }) => {
    const force = Boolean(body.force)
    let sanitizedProviderIds = body.providerIds

    if (body.providerId && !sanitizedProviderIds) {
      sanitizedProviderIds = [body.providerId]
    }

    if (body.allUsers) {
      if (!auth.isCron) {
        return { error: 'Global scheduling restricted to cron requests', status: 403 }
      }

      const result = await scheduleSyncsForAllUsers({ force, providerIds: sanitizedProviderIds })
      return { scope: 'all-users', ...result }
    }

    let targetUserId = body.userId ?? query.userId ?? null
    if (!auth.isCron) {
      const isAdmin = auth.claims?.role === 'admin' || (
        auth.email && (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim().toLowerCase()).includes(auth.email.toLowerCase())
      )

      if (targetUserId && targetUserId !== auth.uid && !isAdmin) {
        return { error: 'Admin access required', status: 403 }
      }
      targetUserId = targetUserId ?? auth.uid ?? null
    }

  if (!targetUserId) {
    return { error: 'Missing userId', status: 400 }
  }

  if (sanitizedProviderIds && sanitizedProviderIds.length === 1) {
    const providerId = sanitizedProviderIds[0]
    const scheduled = await scheduleIntegrationSync({ userId: targetUserId, providerId, force })
    return { userId: targetUserId, providerId, scheduled }
  }

  const result = await scheduleSyncsForUser({ userId: targetUserId, providerIds: sanitizedProviderIds, force })
  return { userId: targetUserId, ...result }
})