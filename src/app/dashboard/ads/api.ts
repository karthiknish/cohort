import type { IntegrationStatusResponse, MetricRecord, MetricsResponse } from './types'
import {
    DEFAULT_SYNC_FREQUENCY_MINUTES,
    DEFAULT_TIMEFRAME_DAYS,
    FREQUENCY_OPTIONS,
    TIMEFRAME_OPTIONS,
} from './constants'

export async function fetchIntegrationStatuses(token: string, userId?: string | null): Promise<IntegrationStatusResponse> {
    const url = userId ? `/api/integrations/status?userId=${encodeURIComponent(userId)}` : '/api/integrations/status'
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    })
    if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}))
        throw new Error(errorPayload.error || 'Failed to load integration status')
    }
    return response.json()
}

export async function fetchMetrics(
    token: string,
    options: { userId?: string | null; cursor?: string | null; pageSize?: number } = {},
): Promise<MetricsResponse> {
    const params = new URLSearchParams()
    if (options.userId) {
        params.set('userId', options.userId)
    }
    if (typeof options.pageSize === 'number') {
        params.set('pageSize', String(options.pageSize))
    }
    if (options.cursor) {
        params.set('after', options.cursor)
    }

    const queryString = params.toString()
    const url = queryString.length > 0 ? `/api/metrics?${queryString}` : '/api/metrics'

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    })

    const payload = (await response.json().catch(() => null)) as
        | { metrics?: MetricRecord[]; nextCursor?: string | null; error?: string }
        | null

    if (!response.ok || !payload || !Array.isArray(payload.metrics)) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Failed to load ad metrics'
        throw new Error(message)
    }

    return {
        metrics: payload.metrics,
        nextCursor: typeof payload.nextCursor === 'string' && payload.nextCursor.length > 0 ? payload.nextCursor : null,
    }
}

export function normalizeFrequency(value?: number | null): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        const clamped = Math.min(Math.max(Math.round(value), FREQUENCY_OPTIONS[0].value), FREQUENCY_OPTIONS.at(-1)?.value ?? 1440)
        return clamped
    }
    return DEFAULT_SYNC_FREQUENCY_MINUTES
}

export function normalizeTimeframe(value?: number | null): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        const clamped = Math.min(Math.max(Math.round(value), TIMEFRAME_OPTIONS[0].value), TIMEFRAME_OPTIONS.at(-1)?.value ?? DEFAULT_TIMEFRAME_DAYS)
        return clamped
    }
    return DEFAULT_TIMEFRAME_DAYS
}
