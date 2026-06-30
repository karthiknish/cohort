import { buildAdsMetricsCharts, filterMeaningfulCharts, } from '@/lib/export/cohorts-spreadsheet-charts';
import { normalizeAdsProviderId } from '@/domain/ads/provider';
import { formatProviderName } from '@/lib/themes';
import type { MetricRecord, ProviderSummary } from './types';
function buildProviderSummaryTable(providerSummaries: Record<string, ProviderSummary>, formatProviderNameFn: (id: string) => string) {
    const headers = [
        'Platform',
        'Spend',
        'Impressions',
        'Clicks',
        'Conversions',
        'Revenue',
        'CTR (%)',
        'CPC',
        'CPA',
        'ROAS',
    ];
    const rows = Object.entries(providerSummaries).map(([providerId, summary]) => {
        const ctr = summary.impressions > 0 ? (summary.clicks / summary.impressions) * 100 : 0;
        const cpc = summary.clicks > 0 ? summary.spend / summary.clicks : 0;
        const cpa = summary.conversions > 0 ? summary.spend / summary.conversions : 0;
        const roas = summary.spend > 0 && Number.isFinite(summary.revenue) ? summary.revenue / summary.spend : 0;
        return [
            formatProviderNameFn(normalizeAdsProviderId(providerId) ?? providerId),
            summary.spend.toFixed(2),
            summary.impressions,
            summary.clicks,
            summary.conversions,
            (summary.revenue || 0).toFixed(2),
            ctr.toFixed(2),
            cpc.toFixed(2),
            cpa.toFixed(2),
            roas.toFixed(2),
        ];
    });
    return { headers, rows };
}
export async function exportMetricsToCsv(processedMetrics: MetricRecord[], options?: {
    formatProviderNameFn?: (id: string) => string;
    providerSummaries?: Record<string, ProviderSummary>;
}): Promise<void> {
    const formatProviderNameFn = options?.formatProviderNameFn ?? formatProviderName;
    const { exportCohortsSpreadsheetRows } = await import('@/lib/export/cohorts-spreadsheet');
    const headers = [
        'Date',
        'Provider',
        'Currency',
        'Spend',
        'Impressions',
        'Clicks',
        'Conversions',
        'Revenue',
    ];
    const rows = processedMetrics.map((m) => [
        m.date,
        formatProviderNameFn(normalizeAdsProviderId(m.providerId) ?? m.providerId),
        m.currency ?? '',
        m.spend.toFixed(2),
        m.impressions,
        m.clicks,
        m.conversions,
        (m.revenue || 0).toFixed(2),
    ]);
    const extraTables = options?.providerSummaries && Object.keys(options.providerSummaries).length > 0
        ? [
            {
                title: 'Summary by platform',
                ...buildProviderSummaryTable(options.providerSummaries, formatProviderNameFn),
            },
        ]
        : undefined;
    const totalSpend = processedMetrics.reduce((sum, metric) => sum + metric.spend, 0);
    const totalImpressions = processedMetrics.reduce((sum, metric) => sum + metric.impressions, 0);
    const totalClicks = processedMetrics.reduce((sum, metric) => sum + metric.clicks, 0);
    const totalConversions = processedMetrics.reduce((sum, metric) => sum + metric.conversions, 0);
    await exportCohortsSpreadsheetRows({
        filename: `ads-metrics-${new Date().toISOString().split('T')[0]}.xlsx`,
        title: 'Ad platform metrics',
        subtitle: `${processedMetrics.length} daily row${processedMetrics.length === 1 ? '' : 's'}`,
        sheetName: 'Ad Metrics',
        headers,
        rows,
        extraTables,
        metadata: {
            'Total spend': totalSpend.toFixed(2),
            Impressions: totalImpressions.toLocaleString('en-US'),
            Clicks: totalClicks.toLocaleString('en-US'),
            Conversions: totalConversions.toLocaleString('en-US'),
        },
        charts: filterMeaningfulCharts(buildAdsMetricsCharts(processedMetrics.map((metric) => ({
            ...metric,
            revenue: metric.revenue ?? undefined,
        })))),
    });
}
