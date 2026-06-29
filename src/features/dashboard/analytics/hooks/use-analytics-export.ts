'use client';
import { buildAnalyticsExportCharts } from '@/lib/export/cohorts-spreadsheet-charts';
import type { AnalyticsBreakdownRow } from './use-analytics-data';
import type { MetricRecord } from './types';

/**
 * GA metrics are stored using the ads metric schema where:
 *   metric.impressions = users
 *   metric.clicks      = sessions
 *   metric.conversions = conversions
 *   metric.revenue     = revenue
 *   metric.spend       = 0 (GA has no spend)
 *
 * This hook maps those into correctly-labeled export columns for Google
 * Analytics data, and includes breakdown rows (channel/source/device) as
 * extra tables in the spreadsheet.
 */
export function useAnalyticsExport(metrics: MetricRecord[], breakdowns?: AnalyticsBreakdownRow[]) {
    const exportData = metrics.map((metric) => {
        const users = metric.impressions ?? 0;
        const sessions = metric.clicks ?? 0;
        const conversions = metric.conversions ?? 0;
        const revenue = metric.revenue ?? 0;
        return {
            date: metric.date,
            platform: metric.providerId,
            users,
            sessions,
            conversions,
            revenue,
            conversionRate: sessions > 0 ? (conversions / sessions) * 100 : 0,
            revenuePerSession: sessions > 0 ? revenue / sessions : 0,
        };
    });

    const breakdownByDimension = (dimension: AnalyticsBreakdownRow['dimension']) => {
        if (!breakdowns?.length)
            return [];
        const totals = new Map<string, {
            label: string;
            users: number;
            sessions: number;
            conversions: number;
            revenue: number;
        }>();
        for (const row of breakdowns) {
            if (row.dimension !== dimension)
                continue;
            const existing = totals.get(row.dimensionValue) ?? {
                label: row.dimensionValue,
                users: 0,
                sessions: 0,
                conversions: 0,
                revenue: 0,
            };
            existing.users += row.users;
            existing.sessions += row.sessions;
            existing.conversions += row.conversions;
            existing.revenue += row.revenue ?? 0;
            totals.set(row.dimensionValue, existing);
        }
        const totalSessions = Array.from(totals.values()).reduce((sum, e) => sum + e.sessions, 0);
        return Array.from(totals.values())
            .sort((a, b) => b.sessions - a.sessions)
            .map((e) => ({
            ...e,
            share: totalSessions > 0 ? (e.sessions / totalSessions) * 100 : 0,
            conversionRate: e.sessions > 0 ? (e.conversions / e.sessions) * 100 : 0,
        }));
    };

    const channelBreakdown = breakdownByDimension('channel');
    const sourceBreakdown = breakdownByDimension('source');
    const deviceBreakdown = breakdownByDimension('device');

    const exportToSpreadsheet = async (filename?: string) => {
        if (exportData.length === 0) {
            throw new Error('No data to export');
        }
        const headers = [
            'Date',
            'Platform',
            'Users',
            'Sessions',
            'Conversions',
            'Revenue',
            'Conversion Rate (%)',
            'Revenue / Session',
        ];
        const rows = exportData.map((row) => [
            row.date,
            row.platform,
            row.users.toLocaleString(),
            row.sessions.toLocaleString(),
            row.conversions.toLocaleString(),
            row.revenue.toFixed(2),
            row.conversionRate.toFixed(2),
            row.revenuePerSession.toFixed(2),
        ]);

        const extraTables = [
            {
                title: 'Channel breakdown',
                headers: ['Channel', 'Users', 'Sessions', 'Conversions', 'Revenue', 'Share (%)', 'Conv Rate (%)'],
                rows: channelBreakdown.map((e) => [
                    e.label,
                    e.users.toLocaleString(),
                    e.sessions.toLocaleString(),
                    e.conversions.toLocaleString(),
                    e.revenue.toFixed(2),
                    e.share.toFixed(1),
                    e.conversionRate.toFixed(2),
                ]),
            },
            {
                title: 'Source breakdown',
                headers: ['Source', 'Users', 'Sessions', 'Conversions', 'Revenue', 'Share (%)', 'Conv Rate (%)'],
                rows: sourceBreakdown.map((e) => [
                    e.label,
                    e.users.toLocaleString(),
                    e.sessions.toLocaleString(),
                    e.conversions.toLocaleString(),
                    e.revenue.toFixed(2),
                    e.share.toFixed(1),
                    e.conversionRate.toFixed(2),
                ]),
            },
            {
                title: 'Device breakdown',
                headers: ['Device', 'Users', 'Sessions', 'Conversions', 'Revenue', 'Share (%)', 'Conv Rate (%)'],
                rows: deviceBreakdown.map((e) => [
                    e.label,
                    e.users.toLocaleString(),
                    e.sessions.toLocaleString(),
                    e.conversions.toLocaleString(),
                    e.revenue.toFixed(2),
                    e.share.toFixed(1),
                    e.conversionRate.toFixed(2),
                ]),
            },
        ].filter((table) => table.rows.length > 0);

        await (async () => {
            const { exportCohortsSpreadsheetRows } = await import('@/lib/export/cohorts-spreadsheet');
            await exportCohortsSpreadsheetRows({
                filename: filename || `analytics-export-${new Date().toISOString().split('T')[0]}.xlsx`,
                title: 'Analytics export',
                subtitle: `${exportData.length} metric row${exportData.length === 1 ? '' : 's'}`,
                sheetName: 'Analytics',
                headers,
                rows,
                extraTables: extraTables.length > 0 ? extraTables : undefined,
                charts: buildAnalyticsExportCharts(exportData),
            });
        })();
    };
    const exportToJSON = (filename?: string) => {
        if (exportData.length === 0) {
            throw new Error('No data to export');
        }
        const payload = {
            metrics: exportData,
            breakdowns: {
                channel: channelBreakdown,
                source: sourceBreakdown,
                device: deviceBreakdown,
            },
        };
        const jsonContent = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename || `analytics-export-${new Date().toISOString().split('T')[0]}.json`);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    return {
        exportData,
        exportToSpreadsheet,
        /** @deprecated Use exportToSpreadsheet */
        exportToCSV: exportToSpreadsheet,
        exportToJSON,
        canExport: exportData.length > 0,
    };
}
