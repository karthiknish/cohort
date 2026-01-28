import { z } from 'zod'
import { scheduleIntegrationSync, scheduleSyncsForAllUsers, scheduleSyncsForUser } from '@/lib/integration-auto-sync'
import { createApiHandler } from '@/lib/api-handler'
import { ForbiddenError, UnauthorizedError, ValidationError } from '@/lib/api-errors'

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
    rateLimit: 'sensitive',
  },
  async (req, { auth, body, query }) => {
    const force = Boolean(body.force)
    let sanitizedProviderIds = body.providerIds

    if (body.providerId && !sanitizedProviderIds) {
      sanitizedProviderIds = [body.providerId]
    }

    if (body.allUsers) {
      if (!auth.isCron) {
        throw new ForbiddenError('Global scheduling restricted to cron requests')
      }

      const result = await scheduleSyncsForAllUsers({ force, providerIds: sanitizedProviderIds })
      return { scope: 'all-users', ...result }
    }

    let targetUserId = body.userId ?? query.userId ?? null
    if (!auth.isCron) {
      const isAdmin = auth.claims?.role === 'admin'

      if (targetUserId && targetUserId !== auth.uid && !isAdmin) {
        throw new ForbiddenError('Admin access required')
      }
      targetUserId = targetUserId ?? auth.uid ?? null
    }

  if (!targetUserId) {
    throw new UnauthorizedError('Missing userId')
  }

  if (sanitizedProviderIds && sanitizedProviderIds.length === 1) {
    const providerId = sanitizedProviderIds[0]!
    const scheduled = await scheduleIntegrationSync({ userId: targetUserId, providerId, force })
    return { userId: targetUserId, providerId, scheduled }
  }

  const result = await scheduleSyncsForUser({ userId: targetUserId, providerIds: sanitizedProviderIds, force })
  return { userId: targetUserId, ...result }
})