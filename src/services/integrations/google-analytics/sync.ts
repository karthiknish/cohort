import { writeMetricsBatch } from '@/lib/ads-admin';
import { getGoogleAnalyticsIntegration, updateGoogleAnalyticsCredentials, writeAnalyticsMetricsBatch, } from '@/lib/analytics-admin';
import { fetchGoogleAnalyticsBreakdowns } from '@/services/integrations/google-analytics/breakdown';
import { assertGoogleApiOk } from '@/lib/errors/google-api-error';
import { IntegrationTokenError, isTokenExpiringSoon, refreshGoogleAccessToken, } from '@/lib/integration-token-refresh';
import { logger } from '@/lib/logger';
import type { NormalizedMetric } from '@/types/integrations';
import { fetchGoogleAnalyticsProperties, fetchGoogleAnalyticsPropertyCurrency, } from '@/services/integrations/google-analytics/properties';
const RUN_REPORT_PAGE_LIMIT = 10000;
const RUN_REPORT_MAX_PAGES = 20;
function formatGaDate(raw: string): string {
    if (!raw || raw.length !== 8)
        return raw;
    return `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;
}
type GaReportRow = {
    date: string;
    totalUsers: number;
    sessions: number;
    conversions: number;
    totalRevenue: number;
};
export async function runGaReport(options: {
    accessToken: string;
    propertyId: string;
    days: number;
}): Promise<GaReportRow[]> {
    const { accessToken, propertyId, days } = options;
    const allRows: GaReportRow[] = [];
    let offset = 0;
    let rowCount: number | null = null;
    for (let page = 0; page < RUN_REPORT_MAX_PAGES; page += 1) {
        const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                dateRanges: [{ startDate: `${Math.max(days, 1)}daysAgo`, endDate: 'today' }],
                dimensions: [{ name: 'date' }],
                metrics: [
                    { name: 'totalUsers' },
                    { name: 'sessions' },
                    { name: 'conversions' },
                    { name: 'totalRevenue' },
                    { name: 'purchaseRevenue' },
                ],
                limit: RUN_REPORT_PAGE_LIMIT,
                offset,
            }),
        });
        await assertGoogleApiOk(response, 'Failed to fetch Google Analytics report');
        const payload = (await response.json()) as {
            rowCount?: number;
            rows?: Array<{
                dimensionValues?: Array<{
                    value?: string;
                }>;
                metricValues?: Array<{
                    value?: string;
                }>;
            }>;
        };
        if (typeof payload.rowCount === 'number' && Number.isFinite(payload.rowCount)) {
            rowCount = payload.rowCount;
        }
        const pageRows = (payload.rows ?? []).flatMap((row) => {
            const rawDate = row.dimensionValues?.[0]?.value ?? '';
            const metricValues = row.metricValues ?? [];
            const totalUsers = Number(metricValues[0]?.value ?? 0);
            const sessions = Number(metricValues[1]?.value ?? 0);
            const conversions = Number(metricValues[2]?.value ?? 0);
            const totalRevenue = Number(metricValues[3]?.value ?? 0);
            const purchaseRevenue = Number(metricValues[4]?.value ?? 0);
            // Use the maximum of totalRevenue and purchaseRevenue to capture all
            // revenue sources. totalRevenue should include both, but some GA4
            // properties may not report it correctly.
            const resolvedRevenue = Math.max(totalRevenue, purchaseRevenue);
            const date = formatGaDate(rawDate);
            if (typeof date !== 'string' || date.length < 8)
                return [];
            return [{
                    date,
                    totalUsers: Number.isFinite(totalUsers) ? totalUsers : 0,
                    sessions: Number.isFinite(sessions) ? sessions : 0,
                    conversions: Number.isFinite(conversions) ? conversions : 0,
                    totalRevenue: Number.isFinite(resolvedRevenue) ? resolvedRevenue : 0,
                }];
        });
        allRows.push(...pageRows);
        if (pageRows.length === 0)
            break;
        offset += pageRows.length;
        if (rowCount !== null && offset >= rowCount)
            break;
        if (rowCount === null && pageRows.length < RUN_REPORT_PAGE_LIMIT)
            break;
    }
    return allRows;
}
export async function syncGoogleAnalyticsMetrics(options: {
    userId: string;
    clientId?: string | null;
    days?: number;
    requestId?: string | null;
}): Promise<{
    providerId: 'google-analytics';
    propertyId: string;
    propertyName: string | null;
    syncedDays: number;
    written: number;
}> {
    const normalizedClientId = typeof options.clientId === 'string' && options.clientId.trim().length > 0
        ? options.clientId.trim()
        : null;
    const days = Number.isFinite(options.days) && (options.days as number) > 0
        ? Math.max(1, Math.floor(options.days as number))
        : 30;
    const integration = await getGoogleAnalyticsIntegration({
        userId: options.userId,
        clientId: normalizedClientId,
    });
    if (!integration?.accessToken) {
        throw new IntegrationTokenError('Google Analytics is not connected', 'google-analytics', options.userId);
    }
    let accessToken = integration.accessToken;
    if (integration.refreshToken && isTokenExpiringSoon(integration.accessTokenExpiresAt, 10 * 60 * 1000)) {
        accessToken = await refreshGoogleAccessToken({
            userId: options.userId,
            clientId: normalizedClientId,
            providerId: 'google-analytics',
        });
    }
    const propertyId = typeof integration.accountId === 'string' && integration.accountId.length > 0
        ? integration.accountId
        : null;
    const propertyName = typeof integration.accountName === 'string' && integration.accountName.length > 0
        ? integration.accountName
        : null;
    if (!propertyId) {
        const availableProperties = await fetchGoogleAnalyticsProperties({ accessToken });
        if (availableProperties.length === 0) {
            throw new IntegrationTokenError('No Google Analytics properties found for this Google account', 'google-analytics', options.userId);
        }
        throw new IntegrationTokenError('Google Analytics property not configured. Select a property in Analytics setup before syncing.', 'google-analytics', options.userId);
    }
    let reportingCurrency = typeof integration.currency === 'string' && integration.currency.trim().length > 0
        ? integration.currency.trim().toUpperCase()
        : null;
    if (!reportingCurrency) {
        reportingCurrency = await fetchGoogleAnalyticsPropertyCurrency({ accessToken, propertyId });
        if (reportingCurrency) {
            await updateGoogleAnalyticsCredentials({
                userId: options.userId,
                clientId: normalizedClientId,
                currency: reportingCurrency,
            });
        }
    }
    const reportRows = await runGaReport({
        accessToken,
        propertyId,
        days,
    });
    const metrics: NormalizedMetric[] = reportRows.map((row) => ({
        providerId: 'google-analytics',
        clientId: normalizedClientId,
        accountId: propertyId,
        date: row.date,
        spend: 0,
        impressions: row.totalUsers,
        clicks: row.sessions,
        conversions: row.conversions,
        revenue: row.totalRevenue,
        currency: reportingCurrency,
        currencySource: reportingCurrency ? 'integration' : 'unknown',
    }));
    const breakdownRows = await fetchGoogleAnalyticsBreakdowns({
        accessToken,
        propertyId,
        days,
    });
    await Promise.all([
        writeMetricsBatch({
            userId: options.userId,
            clientId: normalizedClientId,
            metrics,
        }),
        writeAnalyticsMetricsBatch({
            userId: options.userId,
            clientId: normalizedClientId,
            propertyId,
            currency: reportingCurrency,
            daily: reportRows.map((row) => ({
                propertyId,
                date: row.date,
                users: row.totalUsers,
                sessions: row.sessions,
                conversions: row.conversions,
                revenue: row.totalRevenue,
                currency: reportingCurrency,
            })),
            breakdowns: breakdownRows.map((row) => ({
                propertyId,
                date: row.date,
                dimension: row.dimension,
                dimensionValue: row.dimensionValue,
                users: row.users,
                sessions: row.sessions,
                conversions: row.conversions,
                revenue: row.revenue,
            })),
        }),
    ]);
    const written = reportRows.length;
    logger.info('[Google Analytics Sync] Completed', {
        userId: options.userId,
        clientId: normalizedClientId,
        propertyId,
        syncedDays: days,
        written,
        breakdownRows: breakdownRows.length,
        requestId: options.requestId ?? undefined,
    });
    return {
        providerId: 'google-analytics',
        propertyId,
        propertyName,
        syncedDays: days,
        written,
    };
}
