import type { RateLimitConfig } from './rate-limiter';

export const DEEPSEEK_RATE_LIMITS = {
    clientSummary: { maxRequests: 8, windowMs: 10 * 60000 },
    meetingNotes: { maxRequests: 6, windowMs: 30 * 60000 },
    meetingWebhookNotes: { maxRequests: 12, windowMs: 30 * 60000 },
    creativeCopy: { maxRequests: 12, windowMs: 10 * 60000 },
    analyticsInsights: { maxRequests: 24, windowMs: 10 * 60000 },
    proposalGeneration: { maxRequests: 6, windowMs: 30 * 60000 },
    adminFeatureAssist: { maxRequests: 12, windowMs: 10 * 60000 },
    workspaceAiAssist: { maxRequests: 12, windowMs: 10 * 60000 },
    agentMessage: { maxRequests: 30, windowMs: 10 * 60000 },
    taskDocumentImport: { maxRequests: 10, windowMs: 10 * 60000 },
    projectDocumentImport: { maxRequests: 10, windowMs: 10 * 60000 },
} satisfies Record<string, RateLimitConfig>;

export type DeepSeekRateLimitName = keyof typeof DEEPSEEK_RATE_LIMITS;

function sanitizeKeyPart(value: string | null | undefined, fallback: string): string {
    if (typeof value !== 'string')
        return fallback;
    const trimmed = value.trim();
    if (!trimmed)
        return fallback;
    return trimmed
        .replace(/[^a-zA-Z0-9._:-]+/g, '_')
        .slice(0, 120);
}

export function buildDeepSeekRateLimitKey(args: {
    name: DeepSeekRateLimitName;
    userId?: string | null;
    workspaceId?: string | null;
    resourceId?: string | null;
    scope?: string | null;
}): string {
    return [
        'deepseek',
        sanitizeKeyPart(args.name, 'unknown'),
        sanitizeKeyPart(args.userId, 'anonymous'),
        sanitizeKeyPart(args.workspaceId, 'global'),
        sanitizeKeyPart(args.scope, 'default'),
        sanitizeKeyPart(args.resourceId, 'all'),
    ].join(':');
}

export function formatDeepSeekRateLimitMessage(resetMs: number): string {
    const retryAfterSeconds = Math.max(1, Math.ceil(resetMs / 1000));
    return `AI request limit exceeded. Please try again in ${retryAfterSeconds} seconds.`;
}
