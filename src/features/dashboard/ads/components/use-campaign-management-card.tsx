'use client'


import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useAction, useConvexAuth } from 'convex/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'

import { toast } from '@/shared/ui/use-toast'
import { getCurrencyInfo, isSupportedCurrency, normalizeCurrencyCode } from '@/constants/currencies'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { asErrorMessage } from '@/lib/convex-errors'
import { adsCampaignGroupsApi, adsCampaignsApi } from '@/lib/convex-api'
import { isPreviewModeEnabled, withPreviewModeSearchParamIfEnabled } from '@/lib/preview-data'

import {
  CampaignManagementConnectedView,
  CampaignManagementDisconnectedState,
  CampaignManagementSetupState,
} from './campaign-management-card-sections'
import {
  INITIAL_CAMPAIGN_MANAGEMENT_STATE,
  campaignManagementReducer,
} from './campaign-management-card-state'
import { buildCampaignColumns, buildGroupColumns } from './campaign-management-card-columns'
import { CampaignManagementActionContext } from './campaign-management-card-table-context'
import type {
  BiddingDraft,
  Campaign,
  CampaignGroup,
  CampaignManagementCardProps,
  CampaignManagementView,
} from './campaign-management-card-types'
import { CreateMetaCampaignDialog } from './create-meta-campaign-dialog'
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils'

function toIsoDateOnly(date: Date): string {
  return date.toISOString().split('T')[0] ?? ''
}

export function useCampaignManagementCard(props: CampaignManagementCardProps) {
  const {
    providerId,
    providerName,
    isConnected,
    dateRange,
    onRefresh,
    setupRequired = false,
    setupTitle,
    setupDescription,
    setupActionLabel,
    onSetupAction,
  } = props
  const { selectedClientId } = useClientContext()
  const { user } = useAuth()
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const canQueryConvex = isAuthenticated && !convexAuthLoading && Boolean(user?.id)
  const { push } = useRouter()
  const listCampaigns = useAction(adsCampaignsApi.listCampaigns)
  const updateCampaign = useAction(adsCampaignsApi.updateCampaign)
  const listCampaignGroups = useAction(adsCampaignGroupsApi.listCampaignGroups)
  const updateCampaignGroup = useAction(adsCampaignGroupsApi.updateCampaignGroup)

  const [state, dispatch] = useReducer(campaignManagementReducer, INITIAL_CAMPAIGN_MANAGEMENT_STATE)
  const [metaCreateOpen, setMetaCreateOpen] = useState(false)
  const adsProviderId = toAdsProviderId(providerId)
  const isMetaProvider = adsProviderId === 'facebook'
  const {
    campaigns,
    loading,
    actionLoading,
    budgetDialogOpen,
    biddingDialogOpen,
    selectedCampaign,
    selectedGroup,
    newBudget,
    newBidding,
    view,
    groups,
    groupsLoading,
  } = state

  const startDate = useMemo(() => toIsoDateOnly(dateRange.start), [dateRange.start])
  const endDate = useMemo(() => toIsoDateOnly(dateRange.end), [dateRange.end])

  const selectedBudgetTarget = selectedGroup ?? selectedCampaign
  const selectedCurrencyCode = useMemo(
    () => normalizeCurrencyCode(selectedBudgetTarget?.currency),
    [selectedBudgetTarget?.currency]
  )
  const selectedCurrencyInfo = useMemo(
    () => (isSupportedCurrency(selectedCurrencyCode) ? getCurrencyInfo(selectedCurrencyCode) : null),
    [selectedCurrencyCode]
  )
  const selectedCurrencyLabel = selectedCurrencyInfo
    ? `${selectedCurrencyInfo.symbol} ${selectedCurrencyCode}`
    : selectedCurrencyCode

  const openCampaignBudgetDialog = useCallback((campaign: Campaign) => {
    dispatch({ type: 'openCampaignBudgetDialog', campaign })
  }, [])

  const openGroupBudgetDialog = useCallback((group: CampaignGroup) => {
    dispatch({ type: 'openGroupBudgetDialog', group })
  }, [])

  const openCampaignBiddingDialog = useCallback((campaign: Campaign) => {
    dispatch({ type: 'openCampaignBiddingDialog', campaign })
  }, [])

  const fetchCampaigns = useCallback(async () => {
    if (!isConnected || setupRequired || !canQueryConvex) return

    dispatch({ type: 'setLoading', loading: true })
    if (!workspaceId) {
      dispatch({ type: 'setLoading', loading: false })
      return
    }

    await listCampaigns({
      workspaceId,
      providerId: adsProviderId,
      clientId: selectedClientId ?? null,
    })
      .then((result) => {
        dispatch({ type: 'setCampaigns', campaigns: Array.isArray(result) ? (result as Campaign[]) : [] })
      })
      .catch((error) => {
        reportConvexFailure({
        error: error,
        context: 'CampaignManagementCard:fetchCampaigns',
        title: 'Error',
        fallbackMessage: 'Error',
        })
      })
      .finally(() => {
        dispatch({ type: 'setLoading', loading: false })
      })
  }, [adsProviderId, canQueryConvex, isConnected, listCampaigns, selectedClientId, setupRequired, workspaceId])

  const fetchGroups = useCallback(async () => {
    if (!isConnected || setupRequired || adsProviderId !== 'linkedin' || !canQueryConvex) return
    dispatch({ type: 'setGroupsLoading', groupsLoading: true })

    if (!workspaceId) {
      dispatch({ type: 'setGroupsLoading', groupsLoading: false })
      return
    }

    await listCampaignGroups({
      workspaceId,
      providerId: 'linkedin',
      clientId: selectedClientId ?? null,
    })
      .then((result) => {
        dispatch({ type: 'setGroups', groups: Array.isArray(result) ? (result as CampaignGroup[]) : [] })
      })
      .catch((error) => {
        reportConvexFailure({
        error: error,
        context: 'CampaignManagementCard:fetchGroups',
        title: 'Could not load campaign groups',
        fallbackMessage: 'Could not load campaign groups',
        })
      })
      .finally(() => {
        dispatch({ type: 'setGroupsLoading', groupsLoading: false })
      })
  }, [adsProviderId, canQueryConvex, isConnected, listCampaignGroups, selectedClientId, setupRequired, workspaceId])

  const handleRefresh = useCallback(() => {
    if (view === 'groups') {
      void fetchGroups()
      return
    }

    void fetchCampaigns()
  }, [fetchCampaigns, fetchGroups, view])

  const handleMetaCampaignCreated = useCallback(() => {
    void fetchCampaigns()
  }, [fetchCampaigns])

  const handleOpenMetaCreateDialog = useCallback(() => {
    setMetaCreateOpen(true)
  }, [])

  // Auto-load campaigns once Convex auth and workspace context are ready.
  useEffect(() => {
    if (!isConnected || setupRequired || !workspaceId || !canQueryConvex) return

    void fetchCampaigns()
    if (adsProviderId === 'linkedin') {
      void fetchGroups()
    }
  }, [
    adsProviderId,
    canQueryConvex,
    fetchCampaigns,
    fetchGroups,
    isConnected,
    selectedClientId,
    setupRequired,
    workspaceId,
  ])

  const openInsightsPage = useCallback(
    (campaignOrGroupId: string, name: string) => {
      const params = new URLSearchParams({ startDate, endDate })
      if (selectedClientId) params.set('clientId', selectedClientId)
      params.set('campaignName', name)

      push(withPreviewModeSearchParamIfEnabled(
        `/dashboard/ads/campaigns/${adsProviderId}/${campaignOrGroupId}?${params.toString()}`,
        isPreviewModeEnabled(),
      ), { transitionTypes: ['nav-forward'] })
    },
    [adsProviderId, endDate, push, selectedClientId, startDate]
  )

  const handleAction = useCallback(async (campaignId: string, action: 'enable' | 'pause' | 'remove') => {
    dispatch({ type: 'setActionLoading', actionLoading: campaignId })

    if (!workspaceId) {
      notifyFailure({
        title: 'Error',
        message: 'Sign in required',
      })
      dispatch({ type: 'setActionLoading', actionLoading: null })
      return
    }

    await updateCampaign({
      workspaceId,
      providerId: adsProviderId,
      clientId: selectedClientId ?? null,
      campaignId,
      action,
    })
      .then(() => {
        toast({
          title: 'Success',
          description: `Campaign ${action}d successfully`,
        })

        void fetchCampaigns()
        onRefresh?.()
      })
      .catch((error) => {
        reportConvexFailure({
        error: error,
        context: 'CampaignManagementCard:handleAction',
        title: 'Error',
        fallbackMessage: 'Error',
        })
      })
      .finally(() => {
        dispatch({ type: 'setActionLoading', actionLoading: null })
      })
  }, [adsProviderId, fetchCampaigns, onRefresh, selectedClientId, updateCampaign, workspaceId])

  const handleGroupAction = useCallback(async (groupId: string, action: 'enable' | 'pause') => {
    dispatch({ type: 'setActionLoading', actionLoading: groupId })

    if (!workspaceId) {
      notifyFailure({
        title: 'Error',
        message: 'Sign in required',
      })
      dispatch({ type: 'setActionLoading', actionLoading: null })
      return
    }

    await updateCampaignGroup({
      workspaceId,
      providerId: 'linkedin',
      clientId: selectedClientId ?? null,
      campaignGroupId: groupId,
      action,
    })
      .then(() => {
        toast({
          title: 'Success',
          description: `Campaign Group ${action}d successfully`,
        })

        void fetchGroups()
        onRefresh?.()
      })
      .catch((error) => {
        reportConvexFailure({
        error: error,
        context: 'CampaignManagementCard:handleGroupAction',
        title: 'Error',
        fallbackMessage: 'Error',
        })
      })
      .finally(() => {
        dispatch({ type: 'setActionLoading', actionLoading: null })
      })
  }, [fetchGroups, onRefresh, selectedClientId, updateCampaignGroup, workspaceId])

  const handleBudgetUpdate = useCallback(async () => {
    const isGroup = view === 'groups'
    const targetId = isGroup ? selectedGroup?.id : selectedCampaign?.id
    if (!targetId || !newBudget) return

    dispatch({ type: 'setActionLoading', actionLoading: targetId })

    const parsedBudget = parseFloat(newBudget)

    if (!workspaceId) {
      notifyFailure({
        title: 'Error',
        message: 'Sign in required',
      })
      dispatch({ type: 'setActionLoading', actionLoading: null })
      return
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
        })

    await updatePromise
      .then(() => {
        toast({
          title: 'Success',
          description: 'Budget updated successfully',
        })

        dispatch({ type: 'resetBudgetDialog' })
        if (isGroup) {
          void fetchGroups()
        } else {
          void fetchCampaigns()
        }
        onRefresh?.()
      })
      .catch((error) => {
        reportConvexFailure({
        error: error,
        context: 'CampaignManagementCard:handleBudgetUpdate',
        title: 'Error',
        fallbackMessage: 'Error',
        })
      })
      .finally(() => {
        dispatch({ type: 'setActionLoading', actionLoading: null })
      })
  }, [adsProviderId, selectedCampaign, selectedGroup, newBudget, fetchCampaigns, fetchGroups, onRefresh, selectedClientId, view, workspaceId, updateCampaign, updateCampaignGroup])

  const handleBiddingUpdate = useCallback(async () => {
    if (!selectedCampaign || !newBidding.type) return

    dispatch({ type: 'setActionLoading', actionLoading: selectedCampaign.id })

    if (!workspaceId) {
      notifyFailure({
        title: 'Error',
        message: 'Sign in required',
      })
      dispatch({ type: 'setActionLoading', actionLoading: null })
      return
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
        toast({
          title: 'Success',
          description: 'Bidding strategy updated successfully',
        })

        dispatch({ type: 'closeBiddingDialog' })
        void fetchCampaigns()
        onRefresh?.()
      })
      .catch((error) => {
        reportConvexFailure({
        error: error,
        context: 'CampaignManagementCard:handleBiddingUpdate',
        title: 'Error',
        fallbackMessage: 'Error',
        })
      })
      .finally(() => {
        dispatch({ type: 'setActionLoading', actionLoading: null })
      })
  }, [adsProviderId, selectedCampaign, newBidding, fetchCampaigns, onRefresh, selectedClientId, workspaceId, updateCampaign])

  const handleBiddingChange = useCallback((value: BiddingDraft) => {
    dispatch({ type: 'setNewBidding', newBidding: value })
  }, [])

  const handleBiddingOpenChange = useCallback((open: boolean) => {
    dispatch({ type: 'setBiddingDialogOpen', open })
  }, [])

  const handleBudgetChange = useCallback((value: string) => {
    dispatch({ type: 'setNewBudget', newBudget: value })
  }, [])

  const handleBudgetOpenChange = useCallback((open: boolean) => {
    dispatch({ type: 'setBudgetDialogOpen', open })
  }, [])

  const handleViewChange = useCallback((nextView: CampaignManagementView) => {
    dispatch({ type: 'setView', view: nextView })
  }, [])

    const actionContextValue = useMemo(
      () => ({
        actionLoading,
        handleAction,
        openCampaignBiddingDialog,
        openCampaignBudgetDialog,
        handleGroupAction,
        openGroupBudgetDialog,
      }),
      [
        actionLoading,
        handleAction,
        openCampaignBiddingDialog,
        openCampaignBudgetDialog,
        handleGroupAction,
        openGroupBudgetDialog,
      ]
    )

  const campaignColumns = useMemo(() => buildCampaignColumns(), [])
  const groupColumns = useMemo(() => buildGroupColumns(), [])

  if (!isConnected) {
    return <CampaignManagementDisconnectedState providerName={providerName} />
  }

  if (setupRequired) {
    return (
      <CampaignManagementSetupState
        onSetupAction={onSetupAction}
        providerName={providerName}
        setupActionLabel={setupActionLabel}
        setupDescription={setupDescription}
        setupTitle={setupTitle}
      />
    )
  }

  return (
    <CampaignManagementActionContext.Provider value={actionContextValue}>
      {isMetaProvider ? (
        <CreateMetaCampaignDialog
          open={metaCreateOpen}
          onOpenChange={setMetaCreateOpen}
          onCreated={handleMetaCampaignCreated}
        />
      ) : null}
      <CampaignManagementConnectedView
        actionLoading={actionLoading}
        biddingDialogOpen={biddingDialogOpen}
        budgetDialogOpen={budgetDialogOpen}
        campaignColumns={campaignColumns}
        campaigns={campaigns}
        groupColumns={groupColumns}
        groups={groups}
        groupsLoading={groupsLoading}
        loading={loading}
        newBidding={newBidding}
        newBudget={newBudget}
        onBiddingChange={handleBiddingChange}
        onBiddingOpenChange={handleBiddingOpenChange}
        onBudgetChange={handleBudgetChange}
        onBudgetOpenChange={handleBudgetOpenChange}
        onCreateCampaign={isMetaProvider ? handleOpenMetaCreateDialog : undefined}
        onRefresh={handleRefresh}
        onRowClick={openInsightsPage}
        onSubmitBidding={handleBiddingUpdate}
        onSubmitBudget={handleBudgetUpdate}
        onViewChange={handleViewChange}
        providerId={providerId}
        providerName={providerName}
        selectedCampaignName={selectedCampaign?.name}
        selectedCurrencyCode={selectedCurrencyCode}
        selectedCurrencyLabel={selectedCurrencyLabel}
        selectedTargetName={selectedBudgetTarget?.name}
        view={view}
      />
    </CampaignManagementActionContext.Provider>
  )
}
