import { appendMetaAuthParams, buildTimeRange, META_API_BASE } from './client';
import { metaAdsClient } from '../shared/base-client';
import { buildOrganicMetricRow, type OrganicSocialDailyMetric } from './types';
const INSTAGRAM_DAILY_METRICS = ['impressions', 'reach', 'accounts_engaged', 'likes', 'comments', 'shares', 'saves'].join(',');
type InsightValue = {
    value?: unknown;
    end_time?: string;
};
function parseInsightValues(data: Array<{
    name?: string;
    values?: InsightValue[];
}> | undefined) {
    const byName = new Map<string, Map<string, number>>();
    for (const metric of data ?? []) {
        const name = typeof metric?.name === 'string' ? metric.name : null;
        if (!name)
            continue;
        const dateMap = new Map<string, number>();
        for (const point of metric.values ?? []) {
            const endTime = typeof point?.end_time === 'string' ? point.end_time : null;
            if (!endTime)
                continue;
            const date = endTime.slice(0, 10);
            const raw = point?.value;
            const value = typeof raw === 'number'
                ? raw
                : typeof raw === 'object' && raw !== null && 'value' in (raw as object)
                    ? Number((raw as {
                        value?: unknown;
                    }).value ?? 0)
                    : Number(raw ?? 0);
            dateMap.set(date, Number.isFinite(value) ? value : 0);
        }
        byName.set(name, dateMap);
    }
    return byName;
}
function getMetricValue(byName: Map<string, Map<string, number>>, metric: string, date: string): number {
    return byName.get(metric)?.get(date) ?? 0;
}
export async function fetchInstagramUserDailyInsights(options: {
    accessToken: string;
    instagramBusinessId: string;
    instagramBusinessName: string | null;
    timeframeDays: number;
    appSecret?: string | null;
    maxRetries?: number;
}): Promise<OrganicSocialDailyMetric[]> {
    const { accessToken, instagramBusinessId, instagramBusinessName, timeframeDays, appSecret, maxRetries, } = options;
    const range = buildTimeRange(timeframeDays);
    const params = new URLSearchParams({
        metric: INSTAGRAM_DAILY_METRICS,
        period: 'day',
        since: range.since,
        until: range.until,
        metric_type: 'total_value',
    });
    await appendMetaAuthParams({ params, accessToken, appSecret });
    const { payload } = await metaAdsClient.executeRequest<{
        data?: Array<{
            name?: string;
            values?: InsightValue[];
        }>;
    }>({
        url: `${META_API_BASE}/${instagramBusinessId}/insights?${params.toString()}`,
        operation: 'fetchInstagramUserDailyInsights',
        maxRetries,
    });
    const byName = parseInsightValues(payload?.data);
    const dates = new Set<string>();
    for (const dateMap of byName.values()) {
        for (const date of dateMap.keys())
            dates.add(date);
    }
    const rows: OrganicSocialDailyMetric[] = [];
    for (const date of [...dates].toSorted()) {
        const impressions = getMetricValue(byName, 'impressions', date);
        const reach = getMetricValue(byName, 'reach', date);
        const engagedUsers = getMetricValue(byName, 'accounts_engaged', date);
        const reactions = getMetricValue(byName, 'likes', date);
        const comments = getMetricValue(byName, 'comments', date);
        const shares = getMetricValue(byName, 'shares', date);
        const saves = getMetricValue(byName, 'saves', date);
        rows.push(buildOrganicMetricRow({
            surface: 'instagram',
            entityId: instagramBusinessId,
            entityName: instagramBusinessName,
            date,
            impressions,
            reach,
            engagedUsers,
            reactions,
            comments,
            shares,
            saves,
            rawPayload: { metrics: Object.fromEntries([...byName.entries()].map(([k, v]) => [k, v.get(date)])) },
        }));
    }
    return rows;
}
