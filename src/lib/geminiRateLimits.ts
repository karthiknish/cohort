import type { RateLimitConfig } from './rate-limiter'

export const GEMINI_RATE_LIMITS = {
  clientSummary: { maxRequests: 8, windowMs: 10 * 60_000 },
  meetingNotes: { maxRequests: 6, windowMs: 30 * 60_000 },
  meetingWebhookNotes: { maxRequests: 12, windowMs: 30 * 60_000 },
  creativeCopy: { maxRequests: 12, windowMs: 10 * 60_000 },
  analyticsInsights: { maxRequests: 24, windowMs: 10 * 60_000 },
  proposalGeneration: { maxRequests: 6, windowMs: 30 * 60_000 },
  adminFeatureAssist: { maxRequests: 12, windowMs: 10 * 60_000 },
  agentMessage: { maxRequests: 30, windowMs: 10 * 60_000 },
} satisfies Record<string, RateLimitConfig>

export type GeminiRateLimitName = keyof typeof GEMINI_RATE_LIMITS

function sanitizeKeyPart(value: string | null | undefined, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  if (!trimmed) return fallback

  return trimmed
    .replace(/[^a-zA-Z0-9._:-]+/g, '_')
    .slice(0, 120)
}

export function buildGeminiRateLimitKey(args: {
  name: GeminiRateLimitName
  userId?: string | null
  workspaceId?: string | null
  resourceId?: string | null
  scope?: string | null
}): string {
  return [
    'gemini',
    sanitizeKeyPart(args.name, 'unknown'),
    sanitizeKeyPart(args.userId, 'anonymous'),
    sanitizeKeyPart(args.workspaceId, 'global'),
    sanitizeKeyPart(args.scope, 'default'),
    sanitizeKeyPart(args.resourceId, 'all'),
  ].join(':')
}

export function formatGeminiRateLimitMessage(resetMs: number): string {
  const retryAfterSeconds = Math.max(1, Math.ceil(resetMs / 1000))
  return `Gemini request limit exceeded. Please try again in ${retryAfterSeconds} seconds.`
}