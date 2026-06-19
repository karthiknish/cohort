'use client';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useAction, useConvexAuth, useQuery } from 'convex/react';
import { useRouter } from '@/shared/ui/navigation';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { api } from '/_generated/api';
import { getCurrencyInfo, isSupportedCurrency, normalizeCurrencyCode } from '@/constants/currencies';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { asErrorMessage } from '@/lib/convex-errors';
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { adsCampaignGroupsApi, adsCampaignsApi } from '@/lib/convex-api';
import { isPreviewModeEnabled, withPreviewModeSearchParamIfEnabled } from '@/lib/preview-data';
import { CampaignManagementConnectedView, CampaignManagementDisconnectedState, CampaignManagementSetupState, } from './campaign-management-card-sections';
import { INITIAL_CAMPAIGN_MANAGEMENT_STATE, campaignManagementReducer, } from './campaign-management-card-state';
import { buildCampaignColumns, buildGroupColumns } from './campaign-management-card-columns';
import { CampaignManagementActionContext } from './campaign-management-card-table-context';
import type { BiddingDraft, Campaign, CampaignGroup, CampaignManagementCardProps, CampaignManagementView, } from './campaign-management-card-types';
import { CreateMetaCampaignDialog } from './create-meta-campaign-dialog';
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils';
function toIsoDateOnly(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
}
type HistoricalMetricRow = {
    campaignId?: string | null;
    campaignName?: string | null;
    currency?: string | null;
    date: string;
};
function buildHistoricalCampaigns(metrics: HistoricalMetricRow[] | undefined, providerId: string): Campaign[] {
    if (!Array.isArray(metrics) || metrics.length === 0)
        return [];
    const historicalCampaignMap = new Map<string, Campaign>();
    metrics.forEach((metric) => {
        const campaignId = typeof metric.campaignId === 'string' ? metric.campaignId.trim() : '';
        if (!campaignId)
            return;
        const campaignName = typeof metric.campaignName === 'string' ? metric.campaignName.trim() : '';
        const existing = historicalCampaignMap.get(campaignId);
        if (!existing) {
            historicalCampaignMap.set(campaignId, {
                id: campaignId,
                name: campaignName || campaignId,
                campaignName: campaignName || undefined,
                providerId,
                status: 'Historical',
                currency: metric.currency ?? undefined,
                startTime: metric.date,
                stopTime: metric.date,
                isHistorical: true,
            });
            return;
        }
        if (!existing.currency && metric.currency) {
            existing.currency = metric.currency;
        }
        if (!existing.campaignName && campaignName) {
            existing.campaignName = campaignName;
            existing.name = campaignName;
        }
        if (!existing.startTime || metric.date < existing.startTime) {
            existing.startTime = metric.date;
        }
        if (!existing.stopTime || metric.date > existing.stopTime) {
            existing.stopTime = metric.date;
        }
    });
    return Array.from(historicalCampaignMap.values()).sort((left, right) => (right.stopTime ?? '').localeCompare(left.stopTime ?? ''));
}
function mergeCampaigns(liveCampaigns: Campaign[], historicalCampaigns: Campaign[]): Campaign[] {
    if (historicalCampaigns.length === 0)
        return liveCampaigns;
    if (liveCampaigns.length === 0)
        return historicalCampaigns;
    const merged = new Map<string, Campaign>();
    liveCampaigns.forEach((campaign) => {
        merged.set(campaign.id, campaign);
    });
    historicalCampaigns.forEach((campaign) => {
        if (!merged.has(campaign.id)) {
            merged.set(campaign.id, campaign);
        }
    });
    return Array.from(merged.values());
}
export function useCampaignManagementCard(props: CampaignManagementCardProps) {
    const { providerId, providerName, isConnected, dateRange, onRefresh, setupRequired = false, setupTitle, setupDescription, setupActionLabel, onSetupAction, } = props;
    const { selectedClientId } = useClientContext();
    const { user } = useAuth();
    const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const canQueryConvex = isAuthenticated && !convexAuthLoading && Boolean(user?.id);
    const { push } = useRouter();
    const listCampaigns = useAction(adsCampaignsApi.listCampaigns);
    const updateCampaign = useAction(adsCampaignsApi.updateCampaign);
    const listCampaignGroups = useAction(adsCampaignGroupsApi.listCampaignGroups);
    const updateCampaignGroup = useAction(adsCampaignGroupsApi.updateCampaignGroup);
    const [state, dispatch] = useReducer(campaignManagementReducer, INITIAL_CAMPAIGN_MANAGEMENT_STATE);
    const [metaCreateOpen, setMetaCreateOpen] = useState(false);
    const adsProviderId = toAdsProviderId(providerId);
    const isMetaProvider = adsProviderId === 'facebook';
    const { campaigns, loading, actionLoading, budgetDialogOpen, biddingDialogOpen, selectedCampaign, selectedGroup, newBudget, newBidding, view, groups, groupsLoading, } = state;
    const startDate = toIsoDateOnly(dateRange.start);
    const endDate = toIsoDateOnly(dateRange.end);
    const historicalMetrics = useQuery(api.adsMetrics.listMetrics, !isConnected || setupRequired || !workspaceId || !canQueryConvex
        ? 'skip'
        : {
            workspaceId,
            clientId: selectedClientId ?? null,
            providerIds: [adsProviderId],
            startDate,
            endDate,
            limit: 2000,
        }) as HistoricalMetricRow[] | undefined;
    const historicalMetricsQueryError = useConvexQueryError({
        data: historicalMetrics,
        skipped: !isConnected || setupRequired || !workspaceId || !canQueryConvex,
        fallbackMessage: 'Unable to load historical campaign metrics.',
    });
    const historicalCampaigns = useMemo(() => buildHistoricalCampaigns(historicalMetrics, adsProviderId), [historicalMetrics, adsProviderId]);
    const selectedBudgetTarget = selectedGroup ?? selectedCampaign;
    const selectedCurrencyCode = normalizeCurrencyCode(selectedBudgetTarget?.currency);
    const selectedCurrencyInfo = (isSupportedCurrency(selectedCurrencyCode) ? getCurrencyInfo(selectedCurrencyCode) : null);
    const selectedCurrencyLabel = selectedCurrencyInfo
        ? `${selectedCurrencyInfo.symbol} ${selectedCurrencyCode}`
        : selectedCurrencyCode;
    const openCampaignBudgetDialog = useCallback((campaign: Campaign) => {
        dispatch({ type: 'openCampaignBudgetDialog', campaign });
    }, []);
    const openGroupBudgetDialog = useCallback((group: CampaignGroup) => {
        dispatch({ type: 'openGroupBudgetDialog', group });
    }, []);
    const openCampaignBiddingDialog = useCallback((campaign: Campaign) => {
        dispatch({ type: 'openCampaignBiddingDialog', campaign });
    }, []);
    const fetchCampaigns = useCallback(async () => {
        if (!isConnected || setupRequired || !canQueryConvex)
            return;
        dispatch({ type: 'setLoading', loading: true });
        if (!workspaceId) {
            dispatch({ type: 'setLoading', loading: false });
            return;
        }
        await listCampaigns({
            workspaceId,
            providerId: adsProviderId,
            clientId: selectedClientId ?? null,
        })
            .then((result) => {
            const liveCampaigns = Array.isArray(result) ? (result as Campaign[]) : [];
            dispatch({ type: 'setCampaigns', campaigns: mergeCampaigns(liveCampaigns, historicalCampaigns) });
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'CampaignManagementCard:fetchCampaigns',
                title: 'Error',
                fallbackMessage: 'Error',
            });
        })
            .finally(() => {
            dispatch({ type: 'setLoading', loading: false });
        });
    }, [isConnected, setupRequired, canQueryConvex, workspaceId, listCampaigns, adsProviderId, selectedClientId, historicalCampaigns]);
    const fetchGroups = useCallback(async () => {
        if (!isConnected || setupRequired || adsProviderId !== 'linkedin' || !canQueryConvex)
            return;
        dispatch({ type: 'setGroupsLoading', groupsLoading: true });
        if (!workspaceId) {
            dispatch({ type: 'setGroupsLoading', groupsLoading: false });
            return;
        }
        await listCampaignGroups({
            workspaceId,
            providerId: 'linkedin',
            clientId: selectedClientId ?? null,
        })
            .then((result) => {
            dispatch({ type: 'setGroups', groups: Array.isArray(result) ? (result as CampaignGroup[]) : [] });
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'CampaignManagementCard:fetchGroups',
                title: 'Could not load campaign groups',
                fallbackMessage: 'Could not load campaign groups',
            });
        })
            .finally(() => {
            dispatch({ type: 'setGroupsLoading', groupsLoading: false });
        });
    }, [isConnected, setupRequired, adsProviderId, canQueryConvex, workspaceId, listCampaignGroups, selectedClientId]);
    const handleRefresh = () => {
        if (view === 'groups') {
            void fetchGroups();
            return;
        }
        void fetchCampaigns();
    };
    const handleMetaCampaignCreated = () => {
        void fetchCampaigns();
    };
    const handleOpenMetaCreateDialog = () => {
        setMetaCreateOpen(true);
    };
    // Auto-load campaigns once Convex auth and workspace context are ready.
    useEffect(() => {
        if (!isConnected || setupRequired || !workspaceId || !canQueryConvex)
            return;
        void fetchCampaigns();
        if (adsProviderId === 'linkedin') {
            void fetchGroups();
        }
    }, [
        adsProviderId,
        canQueryConvex,
        isConnected,
        setupRequired,
        workspaceId,
        fetchCampaigns,
        fetchGroups,
    ]);
    const openInsightsPage = (campaignOrGroupId: string, name: string) => {
        const params = new URLSearchParams({ startDate, endDate });
        if (selectedClientId)
            params.set('clientId', selectedClientId);
        params.set('campaignName', name);
        push(withPreviewModeSearchParamIfEnabled(`/dashboard/ads/campaigns/${adsProviderId}/${campaignOrGroupId}?${params.toString()}`, isPreviewModeEnabled()), { transitionTypes: ['nav-forward'] });
    };
    const handleAction = useCallback(async (campaignId: string, action: 'enable' | 'pause' | 'remove') => {
        dispatch({ type: 'setActionLoading', actionLoading: campaignId });
        if (!workspaceId) {
            notifyFailure({
                title: 'Error',
                message: 'Sign in required',
            });
            dispatch({ type: 'setActionLoading', actionLoading: null });
            return;
        }
        await updateCampaign({
            workspaceId,
            providerId: adsProviderId,
            clientId: selectedClientId ?? null,
            campaignId,
            action,
        })
            .then(() => {
            notifySuccess({
                title: 'Success',
                message: `Campaign ${action}d successfully`,
            });
            void fetchCampaigns();
            onRefresh?.();
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'CampaignManagementCard:handleAction',
                title: 'Error',
                fallbackMessage: 'Error',
            });
        })
            .finally(() => {
            dispatch({ type: 'setActionLoading', actionLoading: null });
        });
    }, [workspaceId, adsProviderId, selectedClientId, updateCampaign, fetchCampaigns, onRefresh]);
    const handleGroupAction = useCallback(async (groupId: string, action: 'enable' | 'pause') => {
        dispatch({ type: 'setActionLoading', actionLoading: groupId });
        if (!workspaceId) {
            notifyFailure({
                title: 'Error',
                message: 'Sign in required',
            });
            dispatch({ type: 'setActionLoading', actionLoading: null });
            return;
        }
        await updateCampaignGroup({
            workspaceId,
            providerId: 'linkedin',
            clientId: selectedClientId ?? null,
            campaignGroupId: groupId,
            action,
        })
            .then(() => {
            notifySuccess({
                title: 'Success',
                message: `Campaign Group ${action}d successfully`,
            });
            void fetchGroups();
            onRefresh?.();
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'CampaignManagementCard:handleGroupAction',
                title: 'Error',
                fallbackMessage: 'Error',
            });
        })
            .finally(() => {
            dispatch({ type: 'setActionLoading', actionLoading: null });
        });
    }, [workspaceId, selectedClientId, updateCampaignGroup, fetchGroups, onRefresh]);
    const handleBudgetUpdate = async () => {
        const isGroup = view === 'groups';
        const targetId = isGroup ? selectedGroup?.id : selectedCampaign?.id;
        if (!targetId || !newBudget)
            return;
        dispatch({ type: 'setActionLoading', actionLoading: targetId });
        const parsedBudget = parseFloat(newBudget);
        if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
            notifyFailure({
                title: 'Invalid budget',
                message: 'Enter a valid budget amount greater than 0.',
            });
            dispatch({ type: 'setActionLoading', actionLoading: null });
            return;
        }
        if (!workspaceId) {
            notifyFailure({
                title: 'Error',
                message: 'Sign in required',
            });
            dispatch({ type: 'setActionLoading', actionLoading: null });
            return;
        }
        const updatePromise = isGroup
            ? updateCampaignGroup({
                workspaceId,
                providerId: 'linkedin',
                clientId: selectedClientId ?? null,
                campaignGroupId: targetId,
                action: 'updateBudget',
                budget: parsedBudget,
            })
            : updateCampaign({
                workspaceId,
                providerId: adsProviderId,
                clientId: selectedClientId ?? null,
                campaignId: targetId,
                action: 'updateBudget',
                budget: parsedBudget,
            });
        await updatePromise
            .then(() => {
            notifySuccess({
                title: 'Success',
                message: 'Budget updated successfully',
            });
            dispatch({ type: 'resetBudgetDialog' });
            if (isGroup) {
                void fetchGroups();
            }
            else {
                void fetchCampaigns();
            }
            onRefresh?.();
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'CampaignManagementCard:handleBudgetUpdate',
                title: 'Error',
                fallbackMessage: 'Error',
            });
        })
            .finally(() => {
            dispatch({ type: 'setActionLoading', actionLoading: null });
        });
    };
    const handleBiddingUpdate = async () => {
        if (!selectedCampaign || !newBidding.type)
            return;
        dispatch({ type: 'setActionLoading', actionLoading: selectedCampaign.id });
        if (!workspaceId) {
            notifyFailure({
                title: 'Error',
                message: 'Sign in required',
            });
            dispatch({ type: 'setActionLoading', actionLoading: null });
            return;
        }
        await updateCampaign({
            workspaceId,
            providerId: adsProviderId,
            clientId: selectedClientId ?? null,
            campaignId: selectedCampaign.id,
            action: 'updateBidding',
            biddingType: newBidding.type,
            biddingValue: parseFloat(newBidding.value || '0'),
        })
            .then(() => {
            notifySuccess({
                title: 'Success',
                message: 'Bidding strategy updated successfully',
            });
            dispatch({ type: 'closeBiddingDialog' });
            void fetchCampaigns();
            onRefresh?.();
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'CampaignManagementCard:handleBiddingUpdate',
                title: 'Error',
                fallbackMessage: 'Error',
            });
        })
            .finally(() => {
            dispatch({ type: 'setActionLoading', actionLoading: null });
        });
    };
    const handleBiddingChange = (value: BiddingDraft) => {
        dispatch({ type: 'setNewBidding', newBidding: value });
    };
    const handleBiddingOpenChange = (open: boolean) => {
        dispatch({ type: 'setBiddingDialogOpen', open });
    };
    const handleBudgetChange = (value: string) => {
        dispatch({ type: 'setNewBudget', newBudget: value });
    };
    const handleBudgetOpenChange = (open: boolean) => {
        dispatch({ type: 'setBudgetDialogOpen', open });
    };
    const handleViewChange = (nextView: CampaignManagementView) => {
        dispatch({ type: 'setView', view: nextView });
    };
    const actionContextValue = useMemo(() => ({
        actionLoading,
        handleAction,
        openCampaignBiddingDialog,
        openCampaignBudgetDialog,
        handleGroupAction,
        openGroupBudgetDialog,
    }), [actionLoading, handleAction, openCampaignBiddingDialog, openCampaignBudgetDialog, handleGroupAction, openGroupBudgetDialog]);
    const campaignColumns = buildCampaignColumns();
    const groupColumns = buildGroupColumns();
    if (!isConnected) {
        return <CampaignManagementDisconnectedState providerName={providerName}/>;
    }
    if (setupRequired) {
        return (<CampaignManagementSetupState onSetupAction={onSetupAction} providerName={providerName} setupActionLabel={setupActionLabel} setupDescription={setupDescription} setupTitle={setupTitle}/>);
    }
    return (<CampaignManagementActionContext.Provider value={actionContextValue}>
      {isMetaProvider ? (<CreateMetaCampaignDialog open={metaCreateOpen} onOpenChange={setMetaCreateOpen} onCreated={handleMetaCampaignCreated}/>) : null}
      <CampaignManagementConnectedView actionLoading={actionLoading} biddingDialogOpen={biddingDialogOpen} budgetDialogOpen={budgetDialogOpen} campaignColumns={campaignColumns} campaigns={campaigns} error={historicalMetricsQueryError} groupColumns={groupColumns} groups={groups} groupsLoading={groupsLoading} loading={loading} newBidding={newBidding} newBudget={newBudget} onBiddingChange={handleBiddingChange} onBiddingOpenChange={handleBiddingOpenChange} onBudgetChange={handleBudgetChange} onBudgetOpenChange={handleBudgetOpenChange} onCreateCampaign={isMetaProvider ? handleOpenMetaCreateDialog : undefined} onRefresh={handleRefresh} onRowClick={openInsightsPage} onSubmitBidding={handleBiddingUpdate} onSubmitBudget={handleBudgetUpdate} onViewChange={handleViewChange} providerId={providerId} providerName={providerName} selectedCampaignName={selectedCampaign?.name} selectedCurrencyCode={selectedCurrencyCode} selectedCurrencyLabel={selectedCurrencyLabel} selectedTargetName={selectedBudgetTarget?.name} view={view}/>
    </CampaignManagementActionContext.Provider>);
}
