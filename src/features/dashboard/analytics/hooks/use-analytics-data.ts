'use client';
import { useAction, useConvexAuth, useQuery } from 'convex/react';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { analyticsInsightsApi, analyticsIntegrationsApi } from '@/lib/convex-api';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { notifyFailure } from '@/lib/notifications';
import { useAccumulatedCursorPages } from '@/lib/hooks/use-accumulated-cursor-pages';
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { getPreviewAnalyticsMetrics, getPreviewAnalyticsInsights, getPreviewAnalyticsBreakdowns } from '@/lib/preview-data';
import { buildProviderIdsKey, normalizeProviderIds } from '../lib/insight-utils';
import type { AlgorithmicInsight, MetricRecord, ProviderInsight } from './types';
import { ANALYTICS_METRICS_PAGE_SIZE, mergeAnalyticsMetricPages, parsePaginatedAnalyticsMetrics, type AnalyticsMetricsPageCursor, } from './use-analytics-metrics-pagination';
export type { AnalyticsMetricsPageCursor } from './use-analytics-metrics-pagination';
export type AnalyticsBreakdownRow = {
    propertyId: string;
    date: string;
    dimension: 'channel' | 'source' | 'device';
    dimensionValue: string;
    users: number;
    sessions: number;
    conversions: number;
    revenue: number | null;
};
export interface UseAnalyticsDataReturn {
    metricsData: MetricRecord[];
    breakdowns: AnalyticsBreakdownRow[];
    metricsNextCursor: AnalyticsMetricsPageCursor | null;
    metricsLoadingMore: boolean;
    metricsError: Error | undefined;
    breakdownsError: Error | undefined;
    metricsLoading: boolean;
    metricsRefreshing: boolean;
    loadMoreMetrics: () => void;
    resetMetricsPagination: () => void;
    mutateMetrics: () => Promise<unknown>;
    insights: ProviderInsight[];
    algorithmic: AlgorithmicInsight[];
    insightsError: Error | undefined;
    insightsLoading: boolean;
    insightsRefreshing: boolean;
    mutateInsights: () => Promise<unknown>;
}
type UseAnalyticsDataOptions = {
    providerIds?: string[];
    includeInsights?: boolean;
    startDate?: string;
    endDate?: string;
};
function matchesProvider(providerId: string, providerIds?: string[]) {
    if (!providerIds || providerIds.length === 0)
        return true;
    return providerIds.includes(providerId);
}
function isGoogleAnalyticsOnly(providerIds: string[]) {
    return providerIds.length === 1 && providerIds[0] === 'google-analytics';
}
export function useAnalyticsData(_token: string | null, periodDays: number, clientId: string | null, isPreviewMode: boolean, workspaceId?: string | null, options?: UseAnalyticsDataOptions): UseAnalyticsDataReturn {
    const includeInsights = options?.includeInsights ?? true;
    const providerIdsKey = buildProviderIdsKey(options?.providerIds);
    const providerIds = normalizeProviderIds(providerIdsKey ? providerIdsKey.split('|') : undefined) ?? [];
    const gaOnly = isGoogleAnalyticsOnly(providerIds);
    const startDate = options?.startDate;
    const endDate = options?.endDate;
    const [insights, setInsights] = useState<ProviderInsight[]>([]);
    const [algorithmic, setAlgorithmic] = useState<AlgorithmicInsight[]>([]);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [insightsRefreshing, setInsightsRefreshing] = useState(false);
    const [insightsError, setInsightsError] = useState<Error | undefined>(undefined);
    const hasFetchedInsightsRef = useRef(false);
    const [metricsLoadCursor, setMetricsLoadCursor] = useState<AnalyticsMetricsPageCursor | null>(null);
    const previewMetrics = (() => {
        if (!isPreviewMode)
            return null;
        return getPreviewAnalyticsMetrics() as MetricRecord[];
    })();
    const previewInsights = (() => {
        if (!isPreviewMode)
            return null;
        return getPreviewAnalyticsInsights();
    })();
    const { isAuthenticated: isConvexAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
    const canQueryConvex = isConvexAuthenticated && !isConvexLoading;
    const metricsScopeKey = `${workspaceId ?? ''}|${clientId ?? ''}|${startDate ?? ''}|${endDate ?? ''}|${isPreviewMode ? 'preview' : 'live'}`;
    const metricsQueryEnabled = gaOnly && !isPreviewMode && Boolean(workspaceId) && canQueryConvex;
    const gaMetricsRealtime = useQuery(analyticsIntegrationsApi.listAnalyticsMetricsPaginated, gaOnly && !isPreviewMode && workspaceId && canQueryConvex
        ? {
            workspaceId,
            clientId: clientId ?? null,
            startDate,
            endDate,
            limit: ANALYTICS_METRICS_PAGE_SIZE,
            cursor: metricsLoadCursor,
        }
        : 'skip');
    const gaBreakdownsRealtime = useQuery(analyticsIntegrationsApi.listAnalyticsBreakdowns, gaOnly && !isPreviewMode && workspaceId && canQueryConvex
        ? {
            workspaceId,
            clientId: clientId ?? null,
            startDate,
            endDate,
        }
        : 'skip');
    const gaMetricsQueryError = useConvexQueryError({
        data: gaMetricsRealtime,
        skipped: isPreviewMode || !gaOnly || !workspaceId || !canQueryConvex,
        loading: isConvexLoading,
        fallbackMessage: 'Unable to load analytics metrics.',
    });
    const gaBreakdownsQueryError = useConvexQueryError({
        data: gaBreakdownsRealtime,
        skipped: isPreviewMode || !gaOnly || !workspaceId || !canQueryConvex,
        loading: isConvexLoading,
        fallbackMessage: 'Unable to load analytics breakdowns.',
    });
    const generateInsights = useAction(analyticsInsightsApi.generateInsights);
    const fetchInsights = useEffectEvent(async () => {
        if (isPreviewMode || !workspaceId || !includeInsights)
            return;
        const isInitialLoad = !hasFetchedInsightsRef.current;
        if (isInitialLoad) {
            setInsightsLoading(true);
        }
        else {
            setInsightsRefreshing(true);
        }
        setInsightsError(undefined);
        try {
            const result = await generateInsights({
                workspaceId,
                clientId: clientId ?? undefined,
                periodDays,
                providerIds,
            });
            setInsights(result.insights as ProviderInsight[]);
            setAlgorithmic(result.algorithmic as AlgorithmicInsight[]);
            hasFetchedInsightsRef.current = true;
        }
        catch (error) {
            logError(error, 'useAnalyticsData:fetchInsights');
            setInsightsError(new Error(asErrorMessage(error)));
        }
        finally {
            setInsightsLoading(false);
            setInsightsRefreshing(false);
        }
    });
    const insightsFetchKey = !isPreviewMode && workspaceId && includeInsights
        ? `${workspaceId}|${clientId ?? ''}|${periodDays}|${providerIdsKey}`
        : null;
    useEffect(() => {
        if (!insightsFetchKey)
            return;
        void fetchInsights();
    }, [insightsFetchKey]);
    const mutateInsights = async () => {
        await fetchInsights();
    };
    const metricsPagination = useAccumulatedCursorPages<MetricRecord, AnalyticsMetricsPageCursor>({
        scopeKey: metricsScopeKey,
        queryData: gaMetricsRealtime,
        loadCursor: metricsLoadCursor,
        setLoadCursor: setMetricsLoadCursor,
        enabled: metricsQueryEnabled,
        getItemKey: (metric) => metric.id,
        parsePage: (queryData) => {
            const paginated = parsePaginatedAnalyticsMetrics(queryData);
            if (!paginated) {
                return { items: [], nextCursor: null };
            }
            return {
                items: paginated.metrics.map((row) => ({
                    id: row.id,
                    providerId: row.providerId,
                    date: row.date,
                    currency: row.currency,
                    spend: row.spend,
                    impressions: row.impressions,
                    clicks: row.clicks,
                    conversions: row.conversions,
                    revenue: row.revenue,
                })),
                nextCursor: paginated.nextCursor,
            };
        },
        mergePages: mergeAnalyticsMetricPages,
    });
    const previewMappedMetrics = (previewMetrics ?? []).map((row) => {
        const record = row as unknown as Record<string, unknown>;
        return {
            ...(row as MetricRecord),
            currency: typeof record.currency === 'string' ? record.currency : null,
        } satisfies MetricRecord;
    });
    const mappedMetrics = isPreviewMode ? previewMappedMetrics : metricsPagination.mergedItems;
    const breakdowns = ((): AnalyticsBreakdownRow[] => {
        if (isPreviewMode) {
            return getPreviewAnalyticsBreakdowns() as AnalyticsBreakdownRow[];
        }
        if (!gaBreakdownsRealtime || typeof gaBreakdownsRealtime !== 'object')
            return [];
        const rows = (gaBreakdownsRealtime as {
            breakdowns?: unknown;
        }).breakdowns;
        if (!Array.isArray(rows))
            return [];
        return rows.map((row) => {
            const entry = row as AnalyticsBreakdownRow;
            return {
                ...entry,
                revenue: entry.revenue ?? null,
            };
        });
    })();
    const metricsLoading = metricsQueryEnabled && metricsPagination.isInitialLoading;
    const loadMoreMetrics = () => {
        if (isPreviewMode || metricsLoading) {
            return;
        }
        try {
            metricsPagination.loadMore();
        }
        catch (error) {
            logError(error, 'useAnalyticsData:loadMoreMetrics');
            notifyFailure({ title: 'Metrics pagination error', error });
        }
    };
    const resetMetricsPagination = () => {
        metricsPagination.reset();
    };
    if (isPreviewMode && previewMetrics && previewInsights) {
        return {
            metricsData: mappedMetrics,
            breakdowns,
            metricsNextCursor: null,
            metricsLoadingMore: false,
            resetMetricsPagination: async () => undefined,
            metricsError: undefined,
            breakdownsError: undefined,
            metricsLoading: false,
            metricsRefreshing: false,
            loadMoreMetrics: () => undefined,
            mutateMetrics: async () => undefined,
            insights: (previewInsights.insights as ProviderInsight[]).filter((entry) => matchesProvider(entry.providerId, providerIds)),
            algorithmic: (previewInsights.algorithmic as AlgorithmicInsight[]).filter((entry) => matchesProvider(entry.providerId, providerIds) || entry.providerId === 'global'),
            insightsError: undefined,
            insightsLoading: false,
            insightsRefreshing: false,
            mutateInsights: async () => undefined,
        };
    }
    const metricsError = gaMetricsQueryError ? new Error(gaMetricsQueryError) : undefined;
    const breakdownsError = gaBreakdownsQueryError ? new Error(gaBreakdownsQueryError) : undefined;
    return {
        metricsData: mappedMetrics,
        breakdowns,
        metricsNextCursor: metricsPagination.nextCursor,
        metricsLoadingMore: metricsPagination.isLoadingMore,
        metricsError,
        breakdownsError,
        metricsLoading,
        metricsRefreshing: false,
        loadMoreMetrics,
        resetMetricsPagination,
        mutateMetrics: async () => {
            resetMetricsPagination();
        },
        insights,
        algorithmic,
        insightsError,
        insightsLoading,
        insightsRefreshing,
        mutateInsights,
    };
}
