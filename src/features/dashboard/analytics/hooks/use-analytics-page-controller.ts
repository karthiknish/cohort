'use client';
import { useAction, useMutation, useQuery } from 'convex/react';
import { differenceInDays, endOfDay, format, startOfDay } from 'date-fns';
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { useToast } from '@/shared/ui/use-toast';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { useCurrency } from '@/shared/contexts/preferences-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { ApiClientError, apiFetch } from '@/lib/api-client';
import { analyticsIntegrationsApi } from '@/lib/convex-api';
import { asErrorMessage, isIntegrationScopeAppError, logError, mapGoogleAnalyticsIntegrationError } from '@/lib/convex-errors';
import { getPreviewAnalyticsMetrics } from '@/lib/preview-data';
import { notifyFailure } from '@/lib/notifications';
import type { AnalyticsDateRange } from '../components/analytics-date-range-picker';
import { buildAnalyticsMoneyDisplay } from '../lib/analytics-currency';
import { buildGoogleAnalyticsStory } from '../lib/google-analytics-story';
import { useAnalyticsData } from './use-analytics-data';
import { useGoogleAnalyticsSync } from './use-google-analytics-sync';
type GoogleAnalyticsPropertyOption = {
    id: string;
    name: string;
    resourceName: string;
};
type GoogleAnalyticsStatusRow = {
    providerId: string;
    accountId: string | null;
    accountName: string | null;
    currency: string | null;
    linkedAtMs: number | null;
    lastSyncStatus: string | null;
    lastSyncMessage: string | null;
    lastSyncedAtMs: number | null;
    lastSyncRequestedAtMs: number | null;
};
/** OAuth start can wait on auth + cold API; keep above default fetch assumptions. */
const GOOGLE_ANALYTICS_OAUTH_TIMEOUT_MS = 60000;
const PREVIEW_GA_ACCOUNT_LABEL = 'Preview Google Analytics';
const PREVIEW_GA_PROPERTY_ID = 'preview-google-analytics-property';
function getPreviewGoogleAnalyticsStatus() {
    const latestMetricDate = getPreviewAnalyticsMetrics().reduce<number | null>((latest, metric) => {
        if (metric.providerId !== 'google-analytics')
            return latest;
        const value = new Date(`${metric.date}T12:00:00Z`).getTime();
        if (!Number.isFinite(value))
            return latest;
        return latest === null || value > latest ? value : latest;
    }, null);
    return {
        accountLabel: PREVIEW_GA_ACCOUNT_LABEL,
        propertyId: PREVIEW_GA_PROPERTY_ID,
        lastSyncStatus: 'success',
        lastSyncMessage: null,
        lastSyncedAtMs: latestMetricDate,
        lastSyncRequestedAtMs: latestMetricDate,
    };
}
function formatRelativeSyncTime(valueMs: number | null): string {
    if (!valueMs)
        return 'Never';
    const deltaMs = Date.now() - valueMs;
    const minutes = Math.floor(deltaMs / (60 * 1000));
    if (minutes < 1)
        return 'Just now';
    if (minutes < 60)
        return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7)
        return `${days}d ago`;
    return new Date(valueMs).toLocaleDateString();
}
function mapOauthErrorToMessage(code: string | null, fallback: string | null): string {
    if (fallback && fallback.trim().length > 0) {
        return fallback;
    }
    switch (code) {
        case 'missing_code':
            return 'Google did not return an authorization code. Please try connecting again.';
        case 'invalid_state':
            return 'The OAuth session expired or became invalid. Please retry the connection flow.';
        case 'config_error':
            return 'Google Analytics OAuth is not configured correctly. Please check environment variables.';
        case 'oauth_failed':
            return 'Google Analytics OAuth failed before setup could complete. Please try again.';
        case 'google_analytics_error':
            return 'Google returned an OAuth error. Please retry and grant all requested permissions.';
        default:
            return 'Unable to connect Google Analytics. Please try again.';
    }
}
export function useAnalyticsPageController() {
    const { selectedClientId } = useClientContext();
    const { toast } = useToast();
    const { isPreviewMode } = usePreview();
    const { user } = useAuth();
    const preferenceCurrency = useCurrency();
    const previewGoogleAnalyticsStatus = getPreviewGoogleAnalyticsStatus();
    const [dateRange, setDateRange] = useState<AnalyticsDateRange>(() => {
        const end = endOfDay(new Date());
        const start = startOfDay(new Date(Date.now() - 29 * 24 * 60 * 60 * 1000));
        return { start, end };
    });
    const [periodDays, setPeriodDays] = useState(30);
    const [gaConnected, setGaConnected] = useState(isPreviewMode);
    const [gaAccountLabel, setGaAccountLabel] = useState<string | null>(isPreviewMode ? previewGoogleAnalyticsStatus.accountLabel : null);
    const [gaPropertyId, setGaPropertyId] = useState<string | null>(isPreviewMode ? previewGoogleAnalyticsStatus.propertyId : null);
    const [gaLastSyncStatus, setGaLastSyncStatus] = useState<string | null>(isPreviewMode ? previewGoogleAnalyticsStatus.lastSyncStatus : null);
    const [gaLastSyncMessage, setGaLastSyncMessage] = useState<string | null>(null);
    const [gaLastSyncedAtMs, setGaLastSyncedAtMs] = useState<number | null>(isPreviewMode ? previewGoogleAnalyticsStatus.lastSyncedAtMs : null);
    const [gaLastSyncRequestedAtMs, setGaLastSyncRequestedAtMs] = useState<number | null>(isPreviewMode ? previewGoogleAnalyticsStatus.lastSyncRequestedAtMs : null);
    const [gaIntegrationCurrency, setGaIntegrationCurrency] = useState<string | null>(isPreviewMode ? 'GBP' : null);
    const [gaSetupFlow, setGaSetupFlow] = useState({
        loading: false,
        setupDialogOpen: false,
        setupMessage: null as string | null,
    });
    const gaLoading = gaSetupFlow.loading;
    const gaSetupDialogOpen = gaSetupFlow.setupDialogOpen;
    const gaSetupMessage = gaSetupFlow.setupMessage;
    const setGaLoading = (loading: boolean) => {
        setGaSetupFlow((prev) => ({ ...prev, loading }));
    };
    const setGaSetupDialogOpen = (setupDialogOpen: boolean) => {
        setGaSetupFlow((prev) => ({ ...prev, setupDialogOpen }));
    };
    const setGaSetupMessage = (setupMessage: string | null) => {
        setGaSetupFlow((prev) => ({ ...prev, setupMessage }));
    };
    const [gaProperties, setGaProperties] = useState<GoogleAnalyticsPropertyOption[]>([]);
    const [gaSelectedPropertyId, setGaSelectedPropertyId] = useState('');
    const [gaLoadingProperties, setGaLoadingProperties] = useState(false);
    const [gaInitializingProperty, setGaInitializingProperty] = useState(false);
    const [gaDisconnectDialogOpen, setGaDisconnectDialogOpen] = useState(false);
    const [gaDisconnecting, setGaDisconnecting] = useState(false);
    const googleAnalyticsSyncMutation = useGoogleAnalyticsSync();
    const listGoogleAnalyticsProperties = useAction(analyticsIntegrationsApi.listGoogleAnalyticsProperties);
    const initializeGoogleAnalyticsProperty = useAction(analyticsIntegrationsApi.initializeGoogleAnalyticsProperty);
    const deleteGoogleAnalyticsIntegrationMutation = useMutation(analyticsIntegrationsApi.deleteGoogleAnalyticsIntegration);
    const deleteGoogleAnalyticsSyncJobsMutation = useMutation(analyticsIntegrationsApi.deleteGoogleAnalyticsSyncJobs);
    const deleteGoogleAnalyticsMetricsMutation = useMutation(analyticsIntegrationsApi.deleteGoogleAnalyticsMetrics);
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const googleAnalyticsStatus = useQuery(analyticsIntegrationsApi.getGoogleAnalyticsStatus, isPreviewMode || !workspaceId || !user?.id
        ? 'skip'
        : {
            workspaceId,
            clientId: selectedClientId ?? null,
        }) as GoogleAnalyticsStatusRow | null | undefined;
    const handleDateRangeChange = (range: AnalyticsDateRange, days?: number) => {
        setDateRange(range);
        setPeriodDays(days ?? differenceInDays(range.end, range.start) + 1);
    };
    const refreshGoogleAnalyticsStatus = useEffectEvent(async () => {
        if (isPreviewMode) {
            setGaConnected(true);
            setGaAccountLabel(previewGoogleAnalyticsStatus.accountLabel);
            setGaPropertyId(previewGoogleAnalyticsStatus.propertyId);
            setGaLastSyncStatus(previewGoogleAnalyticsStatus.lastSyncStatus);
            setGaLastSyncMessage(previewGoogleAnalyticsStatus.lastSyncMessage);
            setGaLastSyncedAtMs(previewGoogleAnalyticsStatus.lastSyncedAtMs);
            setGaLastSyncRequestedAtMs(previewGoogleAnalyticsStatus.lastSyncRequestedAtMs);
            return;
        }
        const ga = googleAnalyticsStatus ?? null;
        const linkedAtMs = typeof ga?.linkedAtMs === 'number' ? ga.linkedAtMs : null;
        const accountName = typeof ga?.accountName === 'string' ? ga.accountName : null;
        const accountId = typeof ga?.accountId === 'string' ? ga.accountId : null;
        const integrationCurrency = typeof ga?.currency === 'string' ? ga.currency : null;
        const syncStatus = typeof ga?.lastSyncStatus === 'string' ? ga.lastSyncStatus : null;
        const syncMessage = typeof ga?.lastSyncMessage === 'string' ? ga.lastSyncMessage : null;
        const lastSynced = typeof ga?.lastSyncedAtMs === 'number' ? ga.lastSyncedAtMs : null;
        const lastRequested = typeof ga?.lastSyncRequestedAtMs === 'number' ? ga.lastSyncRequestedAtMs : null;
        setGaConnected(Boolean(linkedAtMs));
        setGaAccountLabel(accountName ?? accountId ?? null);
        setGaPropertyId(accountId);
        setGaIntegrationCurrency(integrationCurrency);
        setGaLastSyncStatus(syncStatus);
        setGaLastSyncMessage(syncMessage);
        setGaLastSyncedAtMs(lastSynced);
        setGaLastSyncRequestedAtMs(lastRequested);
    });
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            void refreshGoogleAnalyticsStatus();
        });
        return () => cancelAnimationFrame(frame);
    }, [googleAnalyticsStatus, isPreviewMode]);
    const gaNeedsPropertySelection = gaConnected && !gaPropertyId;
    const loadGoogleAnalyticsPropertyOptions = useEffectEvent(async (clientIdOverride?: string | null) => {
        if (!workspaceId) {
            return Promise.reject(new Error('Workspace context is required'));
        }
        requestAnimationFrame(() => {
            setGaLoadingProperties(true);
        });
        return listGoogleAnalyticsProperties({
            workspaceId,
            clientId: clientIdOverride ?? selectedClientId ?? null,
        })
            .then((payload) => {
            const options = Array.isArray(payload) ? (payload as GoogleAnalyticsPropertyOption[]) : [];
            setGaProperties(options);
            setGaSelectedPropertyId((current) => {
                if (current && options.some((option) => option.id === current)) {
                    return current;
                }
                return options[0]?.id ?? '';
            });
            return options;
        })
            .catch((error) => {
            setGaProperties([]);
            setGaSelectedPropertyId('');
            const mappedMessage = mapGoogleAnalyticsIntegrationError(error);
            if (isIntegrationScopeAppError(error)) {
                setGaSetupMessage(mappedMessage);
            }
            return Promise.reject(new Error(mappedMessage));
        })
            .finally(() => {
            setGaLoadingProperties(false);
        });
    });
    useEffect(() => {
        if (typeof window === 'undefined')
            return;
        const url = new URL(window.location.href);
        const oauthSuccess = url.searchParams.get('oauth_success') === 'true';
        const oauthError = url.searchParams.get('oauth_error');
        const provider = url.searchParams.get('provider');
        const message = url.searchParams.get('message');
        if (!oauthSuccess && !oauthError)
            return;
        if (provider !== 'google-analytics')
            return;
        url.searchParams.delete('oauth_success');
        url.searchParams.delete('oauth_error');
        url.searchParams.delete('provider');
        url.searchParams.delete('message');
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
        requestAnimationFrame(() => {
            setGaSetupFlow((prev) => ({
                ...prev,
                loading: false,
                setupMessage: oauthSuccess ? null : prev.setupMessage,
                setupDialogOpen: oauthSuccess ? true : prev.setupDialogOpen,
            }));
        });
        if (oauthSuccess) {
            toast({ title: 'Google Analytics connected', description: 'Select a property to finish setup.' });
            void loadGoogleAnalyticsPropertyOptions().catch((error) => {
                const mappedMessage = mapGoogleAnalyticsIntegrationError(error);
                requestAnimationFrame(() => {
                    setGaSetupFlow((prev) => ({ ...prev, setupMessage: mappedMessage }));
                });
                notifyFailure({ title: 'Property load failed', message: mappedMessage });
            });
        }
        else {
            notifyFailure({
                title: 'Google Analytics connection failed',
                message: mapOauthErrorToMessage(oauthError, message),
            });
        }
    }, [toast]);
    const gaPropertyAutoLoadRef = useRef(false);
    const autoLoadGoogleAnalyticsProperties = useEffectEvent(() => {
        if (!gaNeedsPropertySelection || isPreviewMode) {
            gaPropertyAutoLoadRef.current = false;
            return;
        }
        if (!gaSetupDialogOpen) {
            setGaSetupFlow((prev) => ({ ...prev, setupDialogOpen: true }));
        }
        if (gaLoadingProperties || gaProperties.length > 0 || gaPropertyAutoLoadRef.current) {
            return;
        }
        gaPropertyAutoLoadRef.current = true;
        void loadGoogleAnalyticsPropertyOptions().catch((error) => {
            const message = mapGoogleAnalyticsIntegrationError(error);
            setGaSetupFlow((prev) => ({ ...prev, setupMessage: message }));
        });
    });
    useEffect(() => {
        autoLoadGoogleAnalyticsProperties();
    }, [
        gaLoadingProperties,
        gaNeedsPropertySelection,
        gaProperties.length,
        gaSetupDialogOpen,
        isPreviewMode,
    ]);
    const analyticsStartDate = format(dateRange.start, 'yyyy-MM-dd');
    const analyticsEndDate = format(dateRange.end, 'yyyy-MM-dd');
    const { metricsData, breakdowns, metricsNextCursor, metricsLoadingMore, metricsError, metricsLoading, metricsRefreshing, loadMoreMetrics, resetMetricsPagination, mutateMetrics, insights, algorithmic, insightsError, insightsLoading, insightsRefreshing, mutateInsights, } = useAnalyticsData(null, periodDays, selectedClientId ?? null, isPreviewMode, user?.agencyId, {
        providerIds: ['google-analytics'],
        includeInsights: true,
        startDate: analyticsStartDate,
        endDate: analyticsEndDate,
    });
    const handleLoadMoreMetrics = () => {
        if (!metricsNextCursor)
            return;
        try {
            loadMoreMetrics();
        }
        catch (error) {
            logError(error, 'AnalyticsPage:handleLoadMoreMetrics');
            notifyFailure({ title: 'Metrics pagination error', error });
        }
    };
    const metrics = metricsData;
    const selectedRangeDays = Math.max(differenceInDays(dateRange.end, dateRange.start) + 1, 1);
    const handleConnectGoogleAnalytics = async () => {
        if (isPreviewMode) {
            toast({ title: 'Preview mode', description: 'Google Analytics connection is disabled in preview mode.' });
            return;
        }
        if (typeof window === 'undefined')
            return;
        setGaSetupMessage(null);
        setGaLoading(true);
        try {
            const search = new URLSearchParams({
                redirect: `${window.location.pathname}${window.location.search}`,
            });
            if (selectedClientId) {
                search.set('clientId', selectedClientId);
            }
            const target = search.toString().length > 0
                ? `/api/integrations/google-analytics/oauth/start?${search.toString()}`
                : '/api/integrations/google-analytics/oauth/start';
            const payload = await apiFetch<{
                url?: string;
            }>(target, {
                timeoutMs: GOOGLE_ANALYTICS_OAUTH_TIMEOUT_MS,
            });
            if (typeof payload?.url !== 'string' || payload.url.length === 0) {
                throw new Error('Google Analytics OAuth did not return a URL.');
            }
            window.location.href = payload.url;
        }
        catch (error) {
            const isTimeout = error instanceof ApiClientError && error.code === 'REQUEST_TIMEOUT';
            if (!isTimeout) {
                logError(error, 'AnalyticsPage:handleConnectGoogleAnalytics');
            }
            notifyFailure({
                title: 'Unable to connect Google Analytics',
                error,
                message: isTimeout
                    ? 'Request timed out while starting Google connection. Check your network and try again.'
                    : undefined,
            });
            setGaLoading(false);
        }
    };
    const handleSyncGoogleAnalytics = () => {
        if (isPreviewMode) {
            toast({ title: 'Preview mode', description: 'Google Analytics sync is disabled in preview mode.' });
            return;
        }
        if (!gaConnected) {
            notifyFailure({ title: 'Not connected', message: 'Connect Google Analytics before running a sync.' });
            return;
        }
        if (gaNeedsPropertySelection) {
            setGaSetupDialogOpen(true);
            notifyFailure({ title: 'Property required', message: 'Select a Google Analytics property before syncing.' });
            return;
        }
        void googleAnalyticsSyncMutation.mutateAsync({ periodDays, clientId: selectedClientId })
            .then((result) => {
            const propertyName = result?.propertyName;
            const writtenDays = result?.written ?? 0;
            toast({
                title: 'Google Analytics synced',
                description: propertyName ? `Imported ${writtenDays} day(s) from ${propertyName}.` : `Imported ${writtenDays} day(s).`,
            });
            return refreshGoogleAnalyticsStatus();
        })
            .then(() => mutateMetrics())
            .catch((error: unknown) => {
            const isTimeout = error instanceof ApiClientError && error.code === 'REQUEST_TIMEOUT';
            if (!isTimeout) {
                logError(error, 'AnalyticsPage:handleSyncGoogleAnalytics');
            }
            notifyFailure({
                title: 'Sync failed',
                error,
                message: isTimeout
                    ? 'Google Analytics sync timed out. Try a shorter date range or retry.'
                    : undefined,
            });
        });
    };
    const handleOpenGoogleAnalyticsSetup = () => {
        setGaSetupDialogOpen(true);
        setGaSetupMessage(null);
        void loadGoogleAnalyticsPropertyOptions().catch((error) => {
            const message = mapGoogleAnalyticsIntegrationError(error);
            setGaSetupMessage(message);
            notifyFailure({ title: 'Property load failed', message });
        });
    };
    const handleFinalizeGoogleAnalyticsSetup = () => {
        if (isPreviewMode)
            return;
        if (!workspaceId) {
            notifyFailure({ title: 'Setup failed', message: 'Workspace context is required.' });
            return;
        }
        if (!gaSelectedPropertyId) {
            setGaSetupMessage('Please select a Google Analytics property to continue.');
            return;
        }
        setGaInitializingProperty(true);
        setGaSetupMessage(null);
        const clientId = selectedClientId === undefined ? null : selectedClientId;
        void initializeGoogleAnalyticsProperty({ workspaceId, clientId, accountId: gaSelectedPropertyId })
            .then((rawPayload) => {
            const payload = rawPayload as {
                accountName?: string;
            };
            const description = typeof payload.accountName === 'string' && payload.accountName.length > 0
                ? `Using property ${payload.accountName}.`
                : 'Property linked successfully.';
            toast({ title: 'Google Analytics setup complete', description });
            setGaSetupDialogOpen(false);
            return refreshGoogleAnalyticsStatus().then(() => mutateMetrics());
        })
            .catch((error) => {
            const message = mapGoogleAnalyticsIntegrationError(error);
            setGaSetupMessage(message);
            notifyFailure({ title: 'Setup failed', message });
        })
            .finally(() => {
            setGaInitializingProperty(false);
        });
    };
    const handleDisconnectGoogleAnalytics = (options: {
        clearHistoricalData: boolean;
    }): Promise<void> => {
        if (isPreviewMode) {
            return Promise.resolve();
        }
        if (!workspaceId) {
            notifyFailure({ title: 'Disconnect failed', message: 'Workspace context is required.' });
            return Promise.resolve();
        }
        setGaDisconnecting(true);
        const effectiveClientId = selectedClientId === undefined ? null : selectedClientId;
        const deleteMetricsPromise = options.clearHistoricalData
            ? deleteGoogleAnalyticsMetricsMutation({ workspaceId, clientId: effectiveClientId }).then((result) => {
                const typedResult = result as {
                    deleted?: number;
                };
                return typeof typedResult.deleted === 'number' ? typedResult.deleted : 0;
            })
            : Promise.resolve(0);
        return deleteMetricsPromise
            .then((deletedMetrics) => {
            return Promise.all([
                deleteGoogleAnalyticsSyncJobsMutation({ workspaceId, clientId: effectiveClientId }),
                deleteGoogleAnalyticsIntegrationMutation({ workspaceId, clientId: effectiveClientId }),
            ]).then(() => deletedMetrics);
        })
            .then((deletedMetrics) => {
            setGaSetupDialogOpen(false);
            setGaProperties([]);
            setGaSelectedPropertyId('');
            return refreshGoogleAnalyticsStatus().then(() => deletedMetrics);
        })
            .then((deletedMetrics) => {
            toast({
                title: 'Google Analytics disconnected',
                description: options.clearHistoricalData
                    ? `Disconnected and removed ${deletedMetrics} historical metric row(s).`
                    : 'Disconnected. Historical metrics were kept.',
            });
        })
            .catch((error) => {
            notifyFailure({ title: 'Disconnect failed', error });
        })
            .finally(() => {
            setGaDisconnecting(false);
        });
    };
    const initialMetricsLoading = metricsLoading && metrics.length === 0;
    const initialInsightsLoading = insightsLoading && insights.length === 0 && algorithmic.length === 0;
    const filteredMetrics = (() => {
        if (!metrics.length)
            return [];
        const startMs = dateRange.start.getTime();
        const endMs = dateRange.end.getTime();
        return metrics.filter((metric) => {
            if (metric.providerId !== 'google-analytics')
                return false;
            const metricDate = new Date(metric.date).getTime();
            return metricDate >= startMs && metricDate <= endMs;
        });
    })();
    const filteredBreakdowns = (() => {
        if (!breakdowns.length)
            return [];
        const startMs = dateRange.start.getTime();
        const endMs = dateRange.end.getTime();
        return breakdowns.filter((row) => {
            const rowDate = new Date(row.date).getTime();
            return rowDate >= startMs && rowDate <= endMs;
        });
    })();
    const aggregatedByDate = (() => {
        const map = new Map<string, {
            date: string;
            users: number;
            sessions: number;
            conversions: number;
            revenue: number;
        }>();
        filteredMetrics.forEach((metric) => {
            const key = metric.date;
            if (!map.has(key)) {
                map.set(key, { date: key, users: 0, sessions: 0, conversions: 0, revenue: 0 });
            }
            const entry = map.get(key);
            if (!entry)
                return;
            entry.users += metric.impressions;
            entry.sessions += metric.clicks;
            entry.conversions += metric.conversions;
            entry.revenue += metric.revenue ?? 0;
        });
        return Array.from(map.values()).toSorted((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    })();
    const deliveryTotals = filteredMetrics.reduce((acc, metric) => {
        acc.users += metric.impressions;
        acc.sessions += metric.clicks;
        acc.conversions += metric.conversions;
        return acc;
    }, { users: 0, sessions: 0, conversions: 0 });
    const moneyDisplay = buildAnalyticsMoneyDisplay(filteredMetrics, {
        integrationCurrency: gaIntegrationCurrency,
        preferenceCurrency,
    });
    const previousPeriodMetrics = (() => {
        if (!metrics.length)
            return [];
        const previousEndMs = dateRange.start.getTime() - 1;
        const previousStartMs = previousEndMs - selectedRangeDays * 24 * 60 * 60 * 1000 + 1;
        return metrics.filter((metric) => {
            if (metric.providerId !== 'google-analytics')
                return false;
            const metricDate = new Date(metric.date).getTime();
            return metricDate >= previousStartMs && metricDate <= previousEndMs;
        });
    })();
    const previousDeliveryTotals = previousPeriodMetrics.reduce((acc, metric) => {
        acc.users += metric.impressions;
        acc.sessions += metric.clicks;
        acc.conversions += metric.conversions;
        return acc;
    }, { users: 0, sessions: 0, conversions: 0 });
    const previousMoneyDisplay = buildAnalyticsMoneyDisplay(previousPeriodMetrics, {
        integrationCurrency: gaIntegrationCurrency,
        preferenceCurrency,
    });
    const totals = ({
        users: deliveryTotals.users,
        sessions: deliveryTotals.sessions,
        conversions: deliveryTotals.conversions,
        revenue: moneyDisplay.totalRevenue,
    });
    const previousTotals = ({
        users: previousDeliveryTotals.users,
        sessions: previousDeliveryTotals.sessions,
        conversions: previousDeliveryTotals.conversions,
        revenue: previousMoneyDisplay.totalRevenue,
    });
    const conversionRate = totals.sessions > 0 ? (totals.conversions / totals.sessions) * 100 : 0;
    const avgUsersPerDay = totals.users / selectedRangeDays;
    const avgSessionsPerDay = totals.sessions / selectedRangeDays;
    const revenuePerSession = moneyDisplay.revenueComparable && totals.sessions > 0 && moneyDisplay.totalRevenue !== null
        ? moneyDisplay.totalRevenue / totals.sessions
        : null;
    const sessionsPerUser = totals.users > 0 ? totals.sessions / totals.users : 0;
    const hasGaData = filteredMetrics.length > 0;
    const isGaSelectedWithoutData = gaConnected && !hasGaData && !initialMetricsLoading;
    const gaStatusLabel = (() => {
        if (isPreviewMode)
            return 'Preview dataset';
        if (!gaConnected)
            return 'Not connected';
        if (gaNeedsPropertySelection)
            return 'Property setup required';
        if (gaLastSyncStatus === 'error')
            return 'Last sync failed';
        if (gaLastSyncStatus === 'pending')
            return 'Sync queued';
        if (gaLastSyncStatus === 'success')
            return 'Synced';
        return 'Connected';
    })();
    const gaLastSyncedLabel = formatRelativeSyncTime(gaLastSyncedAtMs);
    const gaLastRequestedLabel = formatRelativeSyncTime(gaLastSyncRequestedAtMs);
    const chartData = aggregatedByDate.map((entry) => ({
        ...entry,
        conversionRate: entry.sessions > 0 ? (entry.conversions / entry.sessions) * 100 : 0,
    }));
    const story = buildGoogleAnalyticsStory({
        currentTotals: totals,
        previousTotals,
        chartData,
        selectedRangeDays,
    });
    const handleRefreshMetrics = () => {
        resetMetricsPagination();
        void mutateMetrics();
    };
    const handleRefreshInsights = () => {
        void mutateInsights();
    };
    return {
        algorithmic,
        avgSessionsPerDay,
        avgUsersPerDay,
        breakdowns: filteredBreakdowns,
        chartData,
        conversionRate,
        dateRange,
        displayCurrency: moneyDisplay.displayCurrency,
        filteredMetrics,
        formatRevenue: moneyDisplay.formatRevenue,
        financialComparability: moneyDisplay.financialTotals.comparability,
        gaAccountLabel,
        gaConnected,
        gaDisconnectDialogOpen,
        gaDisconnecting,
        gaInitializingProperty,
        gaLastRequestedLabel,
        gaLastSyncMessage,
        gaLastSyncStatus,
        gaLastSyncedLabel,
        gaLoading,
        gaLoadingProperties,
        gaNeedsPropertySelection,
        gaProperties,
        gaSelectedPropertyId,
        gaSetupDialogOpen,
        gaSetupMessage,
        gaStatusLabel,
        handleConnectGoogleAnalytics,
        handleDateRangeChange,
        handleDisconnectGoogleAnalytics,
        handleFinalizeGoogleAnalyticsSetup,
        handleLoadMoreMetrics,
        handleOpenGoogleAnalyticsSetup,
        handleRefreshInsights,
        handleRefreshMetrics,
        handleSyncGoogleAnalytics,
        initialInsightsLoading,
        initialMetricsLoading,
        insights,
        insightsError,
        insightsLoading,
        insightsRefreshing,
        isGaSelectedWithoutData,
        isPreviewMode,
        isSyncPending: googleAnalyticsSyncMutation.isPending,
        loadGoogleAnalyticsPropertyOptions,
        metricsError,
        metricsLoading,
        metricsLoadingMore,
        metricsNextCursor,
        metricsRefreshing,
        revenueComparable: moneyDisplay.revenueComparable,
        revenuePerSession,
        sessionsPerUser,
        setGaDisconnectDialogOpen,
        setGaSelectedPropertyId,
        setGaSetupDialogOpen,
        story,
        totals,
    };
}
