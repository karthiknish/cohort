'use client';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useEffect, useEffectEvent, useMemo, useReducer } from 'react';
import { useAction } from 'convex/react';
import { useRouter } from '@/shared/ui/navigation';
import { normalizeCurrencyCode } from '@/constants/currencies';
import { useAuth } from '@/shared/contexts/auth-context';
import { logError } from '@/lib/convex-errors';
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils';
import { adsAdMetricsApi, adsAdSetsApi, adsCreativesApi } from '@/lib/convex-api';
import { isPreviewModeEnabled, withPreviewModeSearchParamIfEnabled } from '@/lib/preview-data';
import { computeCreativeTotals, deriveCreativeMetrics, resolveCreativeInsights, getMetricsForAd, sortCreativesByMetric, type CampaignAd, type CreativePerformanceMetrics, type CreativeSortKey, } from './campaign-creative-metrics';
import type { AdMetricRow, CampaignAdsSectionAction, CampaignAdsSectionProps, CampaignAdsSectionState, SupportedProviderId, ViewMode, } from './campaign-ads-section-types';
import { isAdEnabled } from './campaign-ads-section-utils';
function campaignAdsSectionReducer(state: CampaignAdsSectionState, action: CampaignAdsSectionAction): CampaignAdsSectionState {
    switch (action.type) {
        case 'setAdSets':
            return { ...state, adSets: action.value };
        case 'setAdSetDialogOpen':
            return { ...state, adSetDialogOpen: action.value };
        case 'setAds':
            return { ...state, ads: action.value };
        case 'setLoading':
            return { ...state, loading: action.value };
        case 'setSummary':
            return { ...state, summary: action.value };
        case 'setSearchQuery':
            return { ...state, searchQuery: action.value };
        case 'setTypeFilter':
            return { ...state, typeFilter: action.value };
        case 'setStatusFilter':
            return { ...state, statusFilter: action.value };
        case 'setHasLoaded':
            return { ...state, hasLoaded: action.value };
        case 'setViewMode':
            return { ...state, viewMode: action.value };
        case 'setAdMetrics':
            return { ...state, adMetrics: action.value };
        case 'setMetricsLoading':
            return { ...state, metricsLoading: action.value };
        case 'setPeriodDays':
            return { ...state, periodDays: action.value };
        case 'setSortKey':
            return { ...state, sortKey: action.value };
        case 'clearFilters':
            return { ...state, searchQuery: '', typeFilter: 'all', statusFilter: 'all' };
        case 'setTogglingAdSetId':
            return { ...state, togglingAdSetId: action.value };
        default:
            return state;
    }
}
export function createInitialCampaignAdsSectionState(): CampaignAdsSectionState {
    return {
        adSets: [],
        adSetDialogOpen: false,
        ads: [],
        loading: true,
        summary: null,
        searchQuery: '',
        typeFilter: 'all',
        statusFilter: 'all',
        hasLoaded: false,
        viewMode: 'grid',
        adMetrics: {},
        metricsLoading: false,
        periodDays: '30',
        sortKey: 'spend',
        togglingAdSetId: null,
    };
}
export function useCampaignAdsSection({ providerId, campaignId, clientId, isPreviewMode, currency, }: CampaignAdsSectionProps) {
    const { push } = useRouter();
    const { user } = useAuth();
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const displayCurrency = normalizeCurrencyCode(currency);
    const convexProviderId = toAdsProviderId(providerId);
    const isMeta = convexProviderId === 'facebook';
    const listCreatives = useAction(adsCreativesApi.listCreatives);
    const listAdSets = useAction(adsAdSetsApi.listAdSets);
    const updateAdSetStatus = useAction(adsAdSetsApi.updateAdSetStatus);
    const updateCreativeStatus = useAction(adsCreativesApi.updateCreativeStatus);
    const listAdMetrics = useAction(adsAdMetricsApi.listAdMetrics);
    const [state, dispatch] = useReducer(campaignAdsSectionReducer, undefined, createInitialCampaignAdsSectionState);
    const { adSets, adSetDialogOpen, ads, loading, summary, searchQuery, typeFilter, statusFilter, hasLoaded, viewMode, adMetrics, metricsLoading, periodDays, sortKey, togglingAdSetId, } = state;
    const setViewMode = (value: ViewMode) => {
        dispatch({ type: 'setViewMode', value });
    };
    const setSearchQuery = (value: string) => {
        dispatch({ type: 'setSearchQuery', value });
    };
    const setStatusFilter = (value: string) => {
        dispatch({ type: 'setStatusFilter', value });
    };
    const setTypeFilter = (value: string) => {
        dispatch({ type: 'setTypeFilter', value });
    };
    const setPeriodDays = (value: string) => {
        dispatch({ type: 'setPeriodDays', value });
    };
    const setSortKey = (value: CreativeSortKey) => {
        dispatch({ type: 'setSortKey', value });
    };
    const handleAdSetDialogOpenChange = (value: boolean) => {
        dispatch({ type: 'setAdSetDialogOpen', value });
    };
    const canLoad = !isPreviewMode;
    const fetchAds = useEffectEvent(async () => {
        if (!canLoad) {
            dispatch({ type: 'setLoading', value: false });
            return;
        }
        dispatch({ type: 'setLoading', value: true });
        if (!workspaceId) {
            dispatch({ type: 'setLoading', value: false });
            return;
        }
        await listCreatives({
            workspaceId,
            providerId: convexProviderId as SupportedProviderId,
            clientId: clientId ?? null,
            campaignId,
            maxMetaCreativePages: convexProviderId === 'facebook' ? 50 : undefined,
            maxGoogleAdsSearchPages: convexProviderId === 'google' ? 20 : undefined,
        })
            .then((creatives) => {
            const mapped = creatives as CampaignAd[];
            dispatch({ type: 'setAds', value: Array.isArray(mapped) ? mapped : [] });
            dispatch({ type: 'setSummary', value: null });
            dispatch({ type: 'setHasLoaded', value: true });
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'CampaignAdsSection:fetchAds',
                title: 'Error',
                fallbackMessage: 'Error',
            });
        })
            .finally(() => {
            dispatch({ type: 'setLoading', value: false });
        });
    });
    const fetchAdSets = useEffectEvent(async () => {
        if (!canLoad || !workspaceId || !isMeta)
            return;
        await listAdSets({
            workspaceId,
            providerId: 'facebook',
            clientId: clientId ?? null,
            campaignId,
        })
            .then((rows) => {
            dispatch({
                type: 'setAdSets',
                value: Array.isArray(rows)
                    ? rows.map((row) => ({
                        id: row.id,
                        name: row.name || row.id,
                        status: row.status ?? 'PAUSED',
                    }))
                    : [],
            });
        })
            .catch((error) => {
            logError(error, 'CampaignAdsSection:fetchAdSets');
        });
    });
    const fetchMetrics = useEffectEvent(async () => {
        if (!canLoad)
            return;
        dispatch({ type: 'setMetricsLoading', value: true });
        if (!workspaceId) {
            dispatch({ type: 'setMetricsLoading', value: false });
            return;
        }
        await listAdMetrics({
            workspaceId,
            providerId: convexProviderId as SupportedProviderId,
            clientId: clientId ?? null,
            campaignId,
            days: periodDays,
        })
            .then((data) => {
            const metrics = Array.isArray((data as {
                metrics?: AdMetricRow[];
            } | null | undefined)?.metrics)
                ? (data as {
                    metrics?: AdMetricRow[];
                }).metrics ?? []
                : [];
            const aggregated: Record<string, CreativePerformanceMetrics | undefined> = {};
            metrics.forEach((m) => {
                if (!m.adId)
                    return;
                const current = aggregated[m.adId] ?? {
                    spend: 0,
                    impressions: 0,
                    clicks: 0,
                    conversions: 0,
                    revenue: 0,
                    ctr: 0,
                    cpc: 0,
                    cpa: 0,
                    roas: 0,
                };
                current.spend += m.spend ?? 0;
                current.impressions += m.impressions ?? 0;
                current.clicks += m.clicks ?? 0;
                current.conversions += m.conversions ?? 0;
                current.revenue += m.revenue ?? 0;
                aggregated[m.adId] = deriveCreativeMetrics(current) ?? current;
            });
            dispatch({ type: 'setAdMetrics', value: aggregated });
        })
            .catch((error) => {
            logError(error, 'CampaignAdsSection:fetchMetrics');
        })
            .finally(() => {
            dispatch({ type: 'setMetricsLoading', value: false });
        });
    });
    useEffect(() => {
        if (!canLoad || !workspaceId)
            return;
        void fetchAds();
        void fetchAdSets();
    }, [canLoad, campaignId, clientId, convexProviderId, workspaceId]);
    useEffect(() => {
        if (!hasLoaded)
            return;
        void fetchMetrics();
    }, [hasLoaded, periodDays]);
    const uniqueTypes = (() => {
        const types = new Set(ads.map(ad => ad.type || 'Unknown'));
        return Array.from(types);
    })();
    const uniqueStatuses = (() => {
        const statuses = new Set(ads.map(ad => ad.status || 'Unknown'));
        return Array.from(statuses);
    })();
    const availableAdSets = (() => {
        if (adSets.length > 0)
            return adSets;
        const adSetMap = new Map<string, string>();
        ads.forEach((ad) => {
            if (ad.adGroupId && !adSetMap.has(ad.adGroupId)) {
                adSetMap.set(ad.adGroupId, ad.adGroupId);
            }
        });
        return Array.from(adSetMap.values()).map((id) => ({
            id,
            name: `Ad Set ${id.slice(-6)}`,
        }));
    })();
    const firstAdSetId = availableAdSets[0]?.id;
    const filteredAds = ads.filter((ad) => {
        const matchesSearch = !searchQuery ||
            ad.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ad.headlines?.some((h: string) => h.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = typeFilter === 'all' || ad.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
    });
    const sortedFilteredAds = sortCreativesByMetric(filteredAds, adMetrics, sortKey);
    const performanceTotals = (filteredAds.length > 0 ? computeCreativeTotals(filteredAds, adMetrics) : null);
    const creativeInsights = resolveCreativeInsights(sortedFilteredAds, adMetrics);
    const maxSpend = (() => {
        let max = 0;
        for (const ad of sortedFilteredAds) {
            const spend = getMetricsForAd(ad, adMetrics)?.spend ?? 0;
            if (spend > max)
                max = spend;
        }
        return max;
    })();
    const handleCreativeClick = (creative: CampaignAd) => {
        const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
        const cName = creative.name || creative.headlines?.[0] || creative.creativeId;
        params.set('creativeName', cName);
        params.set('currency', displayCurrency);
        push(withPreviewModeSearchParamIfEnabled(`/dashboard/ads/campaigns/${providerId}/${campaignId}/creative/${creative.creativeId}?${params.toString()}`, isPreviewModeEnabled()));
    };
    const toggleAdStatus = (ad: CampaignAd, newStatus: string) => {
        // Optimistic update
        const previousAds = [...ads];
        dispatch({
            type: 'setAds',
            value: ads.map((a) => (a.creativeId === ad.creativeId ? { ...a, status: newStatus } : a)),
        });
        if (!workspaceId) {
            dispatch({ type: 'setAds', value: previousAds });
            notifyFailure({
                title: 'Error',
                message: 'Sign in required',
            });
            return;
        }
        void updateCreativeStatus({
            workspaceId,
            providerId: convexProviderId as SupportedProviderId,
            clientId: clientId ?? null,
            creativeId: ad.creativeId,
            adGroupId: ad.adGroupId,
            status: newStatus as 'ACTIVE' | 'PAUSED' | 'ENABLED' | 'DISABLED' | 'ENABLE' | 'DISABLE',
        })
            .then(() => {
            notifySuccess({
                title: 'Status Updated',
                message: `Ad is now ${newStatus.toLowerCase()}`,
            });
        })
            .catch((error) => {
            // Revert on error
            dispatch({ type: 'setAds', value: previousAds });
            reportConvexFailure({
                error: error,
                context: 'CampaignAdsSection:toggleAdStatus',
                title: 'Error',
                fallbackMessage: 'Error',
            });
        });
    };
    const handleToggleAdStatus = (ad: CampaignAd, nextStatus: string) => {
        void toggleAdStatus(ad, nextStatus);
    };
    const summaryStats = (() => {
        if (!hasLoaded && ads.length === 0)
            return null;
        const total = summary?.total ?? ads.length;
        const totalTypes = summary ? Object.keys(summary.byType).length : new Set(ads.map((ad) => ad.type)).size;
        const activeCount = summary?.byStatus?.ACTIVE ??
            summary?.byStatus?.ENABLED ??
            ads.filter((ad) => isAdEnabled(ad.status)).length;
        return { total, totalTypes, activeCount };
    })();
    const handleClearFilters = () => {
        dispatch({ type: 'clearFilters' });
    };
    const handleRefreshAll = async () => {
        await Promise.all([fetchAds(), fetchMetrics(), fetchAdSets()]);
    };
    const handleAdSetCreated = () => {
        void fetchAdSets();
    };
    const handleOpenAdSetDialog = () => {
        dispatch({ type: 'setAdSetDialogOpen', value: true });
    };
    const handleToggleAdSetStatus = (adSet: {
        id: string;
        name: string;
        status: string;
    }) => {
        if (!workspaceId || isPreviewMode)
            return;
        const nextStatus = adSet.status.toUpperCase() === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        const previous = adSets;
        dispatch({
            type: 'setAdSets',
            value: adSets.map((row) => row.id === adSet.id ? { ...row, status: nextStatus } : row),
        });
        dispatch({ type: 'setTogglingAdSetId', value: adSet.id });
        void updateAdSetStatus({
            workspaceId,
            providerId: 'facebook',
            clientId: clientId ?? null,
            adSetId: adSet.id,
            status: nextStatus,
        })
            .then(() => {
            notifySuccess({
                title: 'Ad set updated',
                message: `${adSet.name} is now ${nextStatus.toLowerCase()}.`,
            });
        })
            .catch((error) => {
            dispatch({ type: 'setAdSets', value: previous });
            reportConvexFailure({
                error,
                context: 'CampaignAdsSection:toggleAdSetStatus',
                title: 'Could not update ad set',
                fallbackMessage: 'Check Meta permissions and try again.',
            });
        })
            .finally(() => {
            dispatch({ type: 'setTogglingAdSetId', value: null });
        });
    };
    return {
        state,
        dispatch,
        workspaceId,
        displayCurrency,
        convexProviderId,
        isMeta,
        canLoad,
        setViewMode,
        setSearchQuery,
        setStatusFilter,
        setTypeFilter,
        setPeriodDays,
        setSortKey,
        handleAdSetDialogOpenChange,
        uniqueTypes,
        uniqueStatuses,
        availableAdSets,
        firstAdSetId,
        filteredAds,
        sortedFilteredAds,
        performanceTotals,
        creativeInsights,
        maxSpend,
        handleCreativeClick,
        handleToggleAdStatus,
        summaryStats,
        handleClearFilters,
        handleRefreshAll,
        handleAdSetCreated,
        handleOpenAdSetDialog,
        loading,
        hasLoaded,
        viewMode,
        adMetrics,
        metricsLoading,
        periodDays,
        sortKey,
        searchQuery,
        statusFilter,
        typeFilter,
        adSetDialogOpen,
        togglingAdSetId,
        handleToggleAdSetStatus,
    };
}
