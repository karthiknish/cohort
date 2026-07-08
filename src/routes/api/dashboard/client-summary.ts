import { createFileRoute } from '@tanstack/react-router'
import { adaptApiHandler } from '@/lib/api-handler-start'
import { z } from 'zod'
import { RateLimitError, UnauthorizedError } from '@/lib/api-errors'
import {
  buildClientSummaryPrompt,
  buildFallbackClientSummary,
  parseClientSummaryResponse,
} from '@/features/dashboard/home/lib/client-summary'
import {
  buildDeepSeekRateLimitKey,
  formatDeepSeekRateLimitMessage,
  DEEPSEEK_RATE_LIMITS,
} from '@/lib/deepseekRateLimits'
import { checkConvexRateLimit } from '@/lib/rate-limiter-convex'
import { DeepSeekAIService, resolveDeepSeekApiKey, resolveDeepSeekModel } from '@/services/deepseek'
import { logError } from '@/lib/convex-errors'

const providerSnapshotSchema = z.object({
  providerId: z.string().min(1),
  spend: z.number(),
  revenue: z.number(),
  conversions: z.number(),
  roas: z.number().nullable(),
})

const proposalSummarySchema = z.object({
  total: z.number(),
  draft: z.number(),
  in_progress: z.number(),
  ready: z.number(),
  partial_success: z.number(),
  sent: z.number(),
  failed: z.number(),
})

const clientSummarySnapshotSchema = z.object({
  clientId: z.string().min(1),
  clientName: z.string().min(1),
  accountManager: z.string().nullable(),
  teamHighlights: z.array(z.string()),
  lastRefreshedIso: z.string().nullable(),
  totalSpend: z.number(),
  totalRevenue: z.number(),
  totalClicks: z.number(),
  totalConversions: z.number(),
  roas: z.number().nullable(),
  activeChannels: z.number(),
  topProvider: z.string().nullable(),
  providerSnapshots: z.array(providerSnapshotSchema),
  taskSummary: z.object({
    total: z.number(),
    overdue: z.number(),
    dueSoon: z.number(),
    highPriority: z.number(),
  }),
  proposalSummary: proposalSummarySchema,
  integrationSummary: z.object({
    totalIntegrations: z.number(),
    failedCount: z.number(),
    pendingCount: z.number(),
    neverCount: z.number(),
  }),
})

const dashboardClientSummarySchema = z.object({
  snapshot: clientSummarySnapshotSchema,
})

const handlers = adaptApiHandler(
  { auth: 'required', workspace: 'optional', bodySchema: dashboardClientSummarySchema, rateLimit: 'sensitive' },
  async (_req, { auth, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }
    const generatedAt = new Date().toISOString()
    const snapshot = body.snapshot
    const model = resolveDeepSeekModel()

    try {
      const rateLimit = await checkConvexRateLimit(
        buildDeepSeekRateLimitKey({
          name: 'clientSummary',
          userId: auth.uid,
          workspaceId: auth.claims?.agencyId ? String(auth.claims.agencyId) : null,
          resourceId: snapshot.clientId,
        }),
        DEEPSEEK_RATE_LIMITS.clientSummary,
      )
      if (!rateLimit.allowed) {
        throw new RateLimitError(formatDeepSeekRateLimitMessage(rateLimit.resetMs))
      }

      const apiKey = resolveDeepSeekApiKey()
      if (!apiKey) {
        return { summary: buildFallbackClientSummary(snapshot, generatedAt) }
      }

      const ai = new DeepSeekAIService(apiKey)
      const raw = await ai.generateContent(buildClientSummaryPrompt(snapshot))
      const parsed = parseClientSummaryResponse({ raw, generatedAt, model })
      return { summary: parsed ?? buildFallbackClientSummary(snapshot, generatedAt) }
    } catch (error) {
      logError(error, '[dashboard/client-summary] Failed to generate AI summary')
      return { summary: buildFallbackClientSummary(snapshot, generatedAt) }
    }
  },
)

export const Route = createFileRoute('/api/dashboard/client-summary')({
  server: { handlers },
})
