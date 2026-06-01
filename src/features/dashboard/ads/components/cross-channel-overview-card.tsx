'use client';
import { useCallback, useMemo, useState } from 'react';
import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme';
import { MotionCard } from '@/shared/ui/motion-primitives';
import type { MetricRecord, MetricsSummary } from './types';
import type { DateRange } from './date-range-picker';
import { CrossChannelOverviewContent, CrossChannelOverviewEmptyState, CrossChannelOverviewHeader, CrossChannelOverviewLoadingState, } from './cross-channel-overview-card-sections';
import { buildCanonicalConnectedIds, buildCrossChannelSummaryCards, filterMetricsByProviders, filterMetricsToConnected, metricsForOverviewDisplay, totalsFromServerSummary, totalsHaveDeliveryActivity, } from './cross-channel-overview-card.utils';
import { resolveAdsMetricsDisplayState, type AdsMetricsDisplayState, } from './ads-metrics-display-state';
import { parseMetricDate } from '../hooks/use-ads-metrics.helpers';
import type { CrossChannelConnectionState } from './cross-channel-overview-card-types';
const EMPTY_CONNECTED_PROVIDER_IDS: string[] = [];
interface CrossChannelOverviewCardProps {
    processedMetrics: MetricRecord[];
    serverSideSummary?: MetricsSummary | null;
    currency?: string;
    /** Canonical or alias ids for platforms currently linked in this workspace. */
    connectedProviderIds?: string[];
    connection: CrossChannelConnectionState;
    hasMetricData: boolean;
    initialMetricsLoading: boolean;
    metricsLoading: boolean;
    dateRange: DateRange;
    onDateRangeChange: (range: DateRange) => void;
    onExport: () => void;
    /** When false, date range and export live in the page header instead of this card. */
    showDateAndExport?: boolean;
}
export function CrossChannelOverviewCard({ processedMetrics, serverSideSummary, currency, connectedProviderIds = EMPTY_CONNECTED_PROVIDER_IDS, hasMetricData, initialMetricsLoading, metricsLoading, dateRange, onDateRangeChange, onExport, showDateAndExport = true, connection, }: CrossChannelOverviewCardProps) {
    const { hasConnectedAds, hasSuccessfulSync } = connection;
    const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
    const canonicalConnected = buildCanonicalConnectedIds(connectedProviderIds);
    const scopedMetrics = filterMetricsToConnected(processedMetrics, canonicalConnected);
    const availableProviders = (() => {
        if (canonicalConnected.length > 0) {
            return canonicalConnected;
        }
        const fromMetrics = scopedMetrics.flatMap((metric) => metric.providerId ? [metric.providerId] : []);
        return [...new Set(fromMetrics)].toSorted();
    })();
    const filteredMetrics = filterMetricsByProviders(scopedMetrics, selectedProviders);
    const overviewMetrics = metricsForOverviewDisplay(filteredMetrics, serverSideSummary, canonicalConnected, selectedProviders, currency);
    const displayState = resolveAdsMetricsDisplayState({
        metricsLoading: initialMetricsLoading || metricsLoading,
        connectedAccountCount: hasConnectedAds ? 1 : 0,
        hasSuccessfulSync,
        hasMetricData,
    });
    const { cards: summaryCards, chartCurrency } = buildCrossChannelSummaryCards(overviewMetrics, displayState);
    const displayCurrency = chartCurrency ?? currency;
    const chartMetrics = (() => {
        const dailyRows = filteredMetrics.filter((metric) => metric.date !== 'summary' && parseMetricDate(metric.date) !== null);
        if (dailyRows.length > 0) {
            return dailyRows;
        }
        return overviewMetrics.filter((metric) => metric.date !== 'summary' && parseMetricDate(metric.date) !== null);
    })();
    const toggleProvider = (providerId: string) => {
        setSelectedProviders((prev) => prev.includes(providerId)
            ? prev.filter((p) => p !== providerId)
            : [...prev, providerId]);
    };
    const hasProviderFilter = selectedProviders.length > 0;
    const hasAggregateChartFallback = (() => {
        if (filteredMetrics.length > 0) {
            return false;
        }
        const totals = totalsFromServerSummary(serverSideSummary, canonicalConnected, selectedProviders);
        return totals !== null && totalsHaveDeliveryActivity(totals);
    })();
    return (<MotionCard className={ADS_PAGE_THEME.surfaceCard}>
      <CrossChannelOverviewHeader availableProviders={availableProviders} dateRange={dateRange} hasMetricData={hasMetricData} hasProviderFilter={hasProviderFilter} onDateRangeChange={onDateRangeChange} onExport={onExport} onToggleProvider={toggleProvider} selectedProviders={selectedProviders} showDateAndExport={showDateAndExport}/>
      {initialMetricsLoading ? (<CrossChannelOverviewLoadingState />) : !hasMetricData && !hasConnectedAds ? (<CrossChannelOverviewEmptyState displayState="needs_connection"/>) : (<CrossChannelOverviewContent currency={displayCurrency} chartMetrics={chartMetrics} metricsLoading={metricsLoading} summaryCards={summaryCards} hasAggregateChartFallback={hasAggregateChartFallback} hasConnectedAds={hasConnectedAds} displayState={displayState}/>)}
    </MotionCard>);
}
