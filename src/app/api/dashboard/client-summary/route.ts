import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { RateLimitError, UnauthorizedError } from '@/lib/api-errors'
import {
  buildClientSummaryPrompt,
  buildFallbackClientSummary,
  parseClientSummaryResponse,
} from '@/app/dashboard/utils/client-summary'
import {
  buildGeminiRateLimitKey,
  formatGeminiRateLimitMessage,
  GEMINI_RATE_LIMITS,
} from '@/lib/geminiRateLimits'
import { checkConvexRateLimit } from '@/lib/rate-limiter-convex'
import { GeminiAIService, resolveGeminiApiKey, resolveGeminiModel } from '@/services/gemini'

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

export const POST = createApiHandler(
  {
    auth: 'required',
    workspace: 'optional',
    bodySchema: dashboardClientSummarySchema,
    rateLimit: 'sensitive',
  },
  async (_req, { auth, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const generatedAt = new Date().toISOString()
    const snapshot = body.snapshot
    const model = resolveGeminiModel()

    try {
      const rateLimit = await checkConvexRateLimit(
        buildGeminiRateLimitKey({
          name: 'clientSummary',
          userId: auth.uid,
          workspaceId: auth.claims?.agencyId ? String(auth.claims.agencyId) : null,
          resourceId: snapshot.clientId,
        }),
        GEMINI_RATE_LIMITS.clientSummary,
      )

      if (!rateLimit.allowed) {
        throw new RateLimitError(formatGeminiRateLimitMessage(rateLimit.resetMs))
      }

      const apiKey = resolveGeminiApiKey()
      if (!apiKey) {
        return {
          summary: buildFallbackClientSummary(snapshot, generatedAt),
        }
      }

      const gemini = new GeminiAIService(apiKey)
      const raw = await gemini.generateContent(buildClientSummaryPrompt(snapshot))
      const parsed = parseClientSummaryResponse({
        raw,
        generatedAt,
        model,
      })

      return {
        summary: parsed ?? buildFallbackClientSummary(snapshot, generatedAt),
      }
    } catch (error) {
      console.error('[dashboard/client-summary] Failed to generate AI summary', error)

      return {
        summary: buildFallbackClientSummary(snapshot, generatedAt),
      }
    }
  }
)