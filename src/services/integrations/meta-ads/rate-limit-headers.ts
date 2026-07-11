// =============================================================================
// META RATE LIMIT HEADERS
// Parses the Meta-specific rate-limit headers returned by the Marketing API
// and returns a normalized, generic RateLimitDetails shape.
//
// Headers:
//   X-Ad-Account-Usage: { acc_id_util_pct, reset_time_duration, ads_api_access_tier }
//   X-Business-Use-Case: { <id>: [{ type, call_count, total_cputime, total_time,
//                                   estimated_time_to_regain_access, ads_api_access_tier }] }
//   X-FB-Ads-Insights-Throttle: { app_id_util_pct, acc_id_util_pct, ads_api_access_tier }
//   X-FB-Ads-Insights-Reach-Throttle: { ... } (string fallback when unknown)
//   Retry-After: seconds
//
// Reference: https://developers.facebook.com/docs/marketing-api/overview/rate-limiting/
// =============================================================================
import { parseRetryAfterMs, type RateLimitDetails } from '@/lib/retry-utils';

const HIGH_UTILIZATION_THRESHOLD = 80;

function parseJsonHeader(headers: Headers, names: string[]): unknown {
    for (const name of names) {
        const value = headers.get(name);
        if (!value) continue;
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }
    return undefined;
}

function parseAdAccountUsageHeader(headers: Headers): Partial<RateLimitDetails> {
    const parsed = parseJsonHeader(headers, ['x-ad-account-usage']);
    if (!parsed || typeof parsed !== 'object') return {};
    const data = parsed as Record<string, unknown>;
    const accIdUtilPct = typeof data.acc_id_util_pct === 'number' ? data.acc_id_util_pct : undefined;
    const resetTimeSeconds = typeof data.reset_time_duration === 'number' ? data.reset_time_duration : undefined;
    const adsApiAccessTier = typeof data.ads_api_access_tier === 'string' ? data.ads_api_access_tier : undefined;
    return {
        source: 'x-ad-account-usage',
        accountUtilizationPct: accIdUtilPct,
        resetTimeSeconds,
        adsApiAccessTier,
    };
}

function parseBusinessUseCaseHeader(headers: Headers): Partial<RateLimitDetails> {
    const parsed = parseJsonHeader(headers, ['x-business-use-case', 'x-business-use-case-usage']);
    if (!parsed || typeof parsed !== 'object') return {};

    let maxCallCount = 0;
    let maxTotalCputime = 0;
    let maxTotalTime = 0;
    let maxEstimatedTimeToRegainAccess = 0;
    let adsApiAccessTier: string | undefined;

    const values = Object.values(parsed as Record<string, unknown>);
    for (const entry of values) {
        const entries = Array.isArray(entry) ? entry : [entry];
        for (const item of entries) {
            if (!item || typeof item !== 'object') continue;
            const data = item as Record<string, unknown>;
            if (typeof data.call_count === 'number') maxCallCount = Math.max(maxCallCount, data.call_count);
            if (typeof data.total_cputime === 'number') maxTotalCputime = Math.max(maxTotalCputime, data.total_cputime);
            if (typeof data.total_time === 'number') maxTotalTime = Math.max(maxTotalTime, data.total_time);
            if (typeof data.estimated_time_to_regain_access === 'number') {
                maxEstimatedTimeToRegainAccess = Math.max(maxEstimatedTimeToRegainAccess, data.estimated_time_to_regain_access);
            }
            if (typeof data.ads_api_access_tier === 'string' && !adsApiAccessTier) {
                adsApiAccessTier = data.ads_api_access_tier;
            }
        }
    }

    return {
        source: 'x-business-use-case',
        callCountPct: maxCallCount || undefined,
        totalCpuTimePct: maxTotalCputime || undefined,
        totalTimePct: maxTotalTime || undefined,
        estimatedTimeToRegainAccessMinutes: maxEstimatedTimeToRegainAccess || undefined,
        adsApiAccessTier,
    };
}

function parseInsightsThrottleHeader(headers: Headers): Partial<RateLimitDetails> {
    const parsed = parseJsonHeader(headers, ['x-fb-ads-insights-throttle']);
    if (!parsed || typeof parsed !== 'object') return {};
    const data = parsed as Record<string, unknown>;
    return {
        source: 'x-fb-ads-insights-throttle',
        appUtilizationPct: typeof data.app_id_util_pct === 'number' ? data.app_id_util_pct : undefined,
        accountUtilizationPct: typeof data.acc_id_util_pct === 'number' ? data.acc_id_util_pct : undefined,
        adsApiAccessTier: typeof data.ads_api_access_tier === 'string' ? data.ads_api_access_tier : undefined,
    };
}

function parseInsightsReachThrottleHeader(headers: Headers): Partial<RateLimitDetails> {
    const raw = parseJsonHeader(headers, ['x-fb-ads-insights-reach-throttle']);
    if (raw === undefined) return {};
    return {
        source: 'x-fb-ads-insights-reach-throttle',
        reachThrottleInfo: typeof raw === 'string' ? raw : JSON.stringify(raw),
    };
}

function computeRetryAfterMs(details: RateLimitDetails, headers: Headers): number | undefined {
    if (details.estimatedTimeToRegainAccessMinutes !== undefined && details.estimatedTimeToRegainAccessMinutes > 0) {
        return details.estimatedTimeToRegainAccessMinutes * 60 * 1000;
    }

    const retryAfterMs = parseRetryAfterMs(headers);
    if (retryAfterMs !== undefined && retryAfterMs > 0) {
        return retryAfterMs;
    }

    if (details.resetTimeSeconds !== undefined && details.resetTimeSeconds > 0) {
        const utilization = Math.max(
            details.accountUtilizationPct ?? 0,
            details.callCountPct ?? 0,
            details.totalCpuTimePct ?? 0,
            details.totalTimePct ?? 0,
            details.appUtilizationPct ?? 0,
        );
        if (utilization >= HIGH_UTILIZATION_THRESHOLD) {
            return details.resetTimeSeconds * 1000;
        }
    }

    return undefined;
}

/**
 * Parse all Meta rate-limit / telemetry headers into a single normalized object.
 * Returns `undefined` when none of the headers are present.
 */
export function parseMetaRateLimitHeaders(headers: Headers): RateLimitDetails | undefined {
    const adAccount = parseAdAccountUsageHeader(headers);
    const businessUseCase = parseBusinessUseCaseHeader(headers);
    const insightsThrottle = parseInsightsThrottleHeader(headers);
    const insightsReachThrottle = parseInsightsReachThrottleHeader(headers);

    if (!adAccount.source && !businessUseCase.source && !insightsThrottle.source && !insightsReachThrottle.source) {
        return undefined;
    }

    const details: RateLimitDetails = {
        ...adAccount,
        ...businessUseCase,
        ...insightsThrottle,
        ...insightsReachThrottle,
    };

    const retryAfterMs = computeRetryAfterMs(details, headers);
    if (retryAfterMs !== undefined) {
        details.retryAfterMs = retryAfterMs;
    }

    return details;
}
