import { checkRateLimit, RATE_LIMITS } from './rate-limiter';
import type { RateLimitConfig, RateLimitResult, RateLimitPreset } from './rate-limiter';
import { internal } from '/_generated/api';
import type { FunctionReference } from 'convex/server';
import { getSystemConvexClient } from './convex-system-client';
type MutationReference = FunctionReference<'mutation'>;
export async function checkConvexRateLimit(key: string, configOrPreset: RateLimitPreset | RateLimitConfig): Promise<RateLimitResult> {
    const config = typeof configOrPreset === 'string' ? RATE_LIMITS[configOrPreset] : configOrPreset;
    const client = getSystemConvexClient();
    // If Convex isn't configured on the server, fall back to in-memory.
    if (!client) {
        return checkRateLimit(key, config);
    }
    try {
        const name = typeof configOrPreset === 'string' ? configOrPreset : `custom:${config.maxRequests}:${config.windowMs}`;
        const result = (await client.mutation(internal.rateLimitApi.limit as unknown as MutationReference, {
            name,
            key,
            config: typeof configOrPreset === 'string'
                ? undefined
                : {
                    kind: 'fixed window',
                    rate: config.maxRequests,
                    period: config.windowMs,
                },
        })) as {
            ok: boolean;
            retryAfterMs: number | null;
        };
        if (result.ok) {
            return {
                allowed: true,
                limit: config.maxRequests,
                remaining: 0,
                resetMs: config.windowMs,
                resetAt: Date.now() + config.windowMs,
            };
        }
        const retryAfterMs = typeof result.retryAfterMs === 'number' ? result.retryAfterMs : config.windowMs;
        return {
            allowed: false,
            limit: config.maxRequests,
            remaining: 0,
            resetMs: retryAfterMs,
            resetAt: Date.now() + retryAfterMs,
        };
    }
    catch (error) {
        console.warn('[rate-limiter] Convex rate limit failed, falling back to in-memory', error);
        return checkRateLimit(key, config);
    }
}
