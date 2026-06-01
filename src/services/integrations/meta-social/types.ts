/** Organic social metrics row — no paid/ad fields allowed. */
export type OrganicSocialDailyMetric = {
    surface: 'facebook' | 'instagram';
    entityId: string;
    entityName: string | null;
    date: string;
    impressions: number;
    reach: number;
    engagedUsers: number;
    reactions?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    followerCount?: number;
    followerDelta?: number;
    engagementRate?: number | null;
    rawPayload?: unknown;
};
const BANNED_ORGANIC_FIELDS = [
    'spend',
    'cost',
    'cpc',
    'cpm',
    'cpa',
    'roas',
    'clicks',
    'ad_id',
    'campaign_id',
    'adset_id',
] as const;
/** Guardrail: reject payloads that look like paid ads metrics. */
export function assertOrganicMetricRow(row: Record<string, unknown>): void {
    for (const key of BANNED_ORGANIC_FIELDS) {
        if (key in row && row[key] !== undefined && row[key] !== null) {
            throw new Error(`Organic social metrics cannot include paid field: ${key}`);
        }
    }
}
export function buildOrganicMetricRow(input: OrganicSocialDailyMetric): OrganicSocialDailyMetric {
    assertOrganicMetricRow(input as unknown as Record<string, unknown>);
    const engagementRate = input.engagementRate ??
        (input.reach > 0 ? input.engagedUsers / input.reach : null);
    return {
        ...input,
        engagementRate,
    };
}
