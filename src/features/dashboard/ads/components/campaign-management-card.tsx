'use client'

import type { ColumnDef } from '@tanstack/react-table'
import type { CellContext, HeaderContext } from '@tanstack/react-table'
import { useAction } from 'convex/react'
import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { Badge } from '@/shared/ui/badge'
import { DataTableColumnHeader } from '@/shared/ui/data-table'
import { toast } from '@/shared/ui/use-toast'
import { formatMoney, getCurrencyInfo, isSupportedCurrency, normalizeCurrencyCode } from '@/constants/currencies'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { adsCampaignGroupsApi, adsCampaignsApi } from '@/lib/convex-api'

import {
  CampaignManagementConnectedView,
  CampaignManagementDisconnectedState,
  CampaignGroupRowActions,
  CampaignManagementSetupState,
  CampaignRowActions,
} from './campaign-management-card-sections'
import type { BiddingDraft, Campaign, CampaignGroup, CampaignManagementView } from './campaign-management-card-types'
import type { DateRange } from './date-range-picker'

// =============================================================================
// TYPES
// =============================================================================

type Props = {
  providerId: string
  providerName: string
  isConnected: boolean
  dateRange: DateRange
  onRefresh?: () => void
  setupRequired?: boolean
  setupTitle?: string
  setupDescription?: string
  setupActionLabel?: string
  onSetupAction?: () => void
}

function toIsoDateOnly(date: Date): string {
  return date.toISOString().split('T')[0] ?? ''
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

function formatCampaignDateRange(startTime?: string, stopTime?: string): string {
  const now = new Date()
  const start = startTime ? new Date(startTime) : null
  const stop = stopTime ? new Date(stopTime) : null

  const hasStart = Boolean(start && !Number.isNaN(start.getTime()))
  const hasStop = Boolean(stop && !Number.isNaN(stop.getTime()))

  if (!hasStart && !hasStop) return 'Always running'

  if (hasStart && !hasStop) {
    const validStart = start as Date
    if (validStart > now) {
      return `Starts ${formatRelativeDate(validStart)}`
    }
    return `Since ${formatRelativeDate(validStart)}`
  }

  if (!hasStart && hasStop) {
    const validStop = stop as Date
    if (validStop > now) {
      return `Until ${formatRelativeDate(validStop)}`
    }
    return `Ended ${formatRelativeDate(validStop)}`
  }

  // Both dates present
  const validStart = start as Date
  const validStop = stop as Date
  const startStr = validStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const endStr = validStop.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  if (validStart > now) {
    return `${startStr} - ${endStr}`
  }
  if (validStop < now) {
    return `Ended ${formatRelativeDate(validStop)}`
  }
  return `${startStr} - ${endStr}`
}

function getStatusBadge(status: string) {
  const statusLower = status.toLowerCase()
  if (statusLower === 'enabled' || statusLower === 'enable' || statusLower === 'active') {
    return <Badge variant="default" className="bg-success">Active</Badge>
  }
  if (statusLower === 'paused' || statusLower === 'disable') {
    return <Badge variant="secondary">Paused</Badge>
  }
  if (statusLower === 'removed' || statusLower === 'archived' || statusLower === 'delete') {
    return <Badge variant="destructive">Removed</Badge>
  }
  return <Badge variant="outline">{status}</Badge>
}

type CampaignManagementActionContextValue = {
  actionLoading: string | null
  handleAction: (campaignId: string, action: 'enable' | 'pause' | 'remove') => Promise<void>
  openCampaignBiddingDialog: (campaign: Campaign) => void
  openCampaignBudgetDialog: (campaign: Campaign) => void
  handleGroupAction: (groupId: string, action: 'enable' | 'pause') => Promise<void>
  openGroupBudgetDialog: (group: CampaignGroup) => void
}

const CampaignManagementActionContext = createContext<CampaignManagementActionContextValue | null>(null)

function useCampaignManagementActions() {
  const context = useContext(CampaignManagementActionContext)
  if (!context) {
    throw new Error('CampaignManagementActionContext is missing')
  }
  return context
}

function CampaignNameHeader({ column }: HeaderContext<Campaign, unknown>) {
  return <DataTableColumnHeader column={column} title="Name" />
}

function CampaignNameCell({ row }: CellContext<Campaign, unknown>) {
  return <span className="font-medium hover:underline">{row.getValue('name')}</span>
}

function CampaignStatusHeader({ column }: HeaderContext<Campaign, unknown>) {
  return <DataTableColumnHeader column={column} title="Status" />
}

function CampaignStatusCell({ row }: CellContext<Campaign, unknown>) {
  return getStatusBadge(row.getValue('status'))
}

function CampaignRunsCell({ row }: CellContext<Campaign, unknown>) {
  return <span className="text-sm text-muted-foreground">{formatCampaignDateRange(row.original.startTime, row.original.stopTime)}</span>
}

function CampaignBudgetHeader({ column }: HeaderContext<Campaign, unknown>) {
  return <DataTableColumnHeader column={column} title="Budget" />
}

function CampaignBudgetCell({ row }: CellContext<Campaign, unknown>) {
  const budget = row.getValue('budget') as number | undefined
  if (budget === undefined) {
    return <span className="text-muted-foreground">-</span>
  }
  return <span>{formatMoney(budget, row.original.currency)}/{row.original.budgetType || 'day'}</span>
}

function CampaignObjectiveHeader({ column }: HeaderContext<Campaign, unknown>) {
  return <DataTableColumnHeader column={column} title="Objective" />
}

function CampaignObjectiveCell({ row }: CellContext<Campaign, unknown>) {
  const objective = row.getValue('objective') as string | undefined
  return <span className="capitalize text-sm text-muted-foreground">{objective?.toLowerCase().replace(/_/g, ' ') || '-'}</span>
}

function CampaignActionsHeader() {
  return <div className="text-right">Actions</div>
}

function CampaignActionsCell({ row }: CellContext<Campaign, unknown>) {
  const { actionLoading, handleAction, openCampaignBiddingDialog, openCampaignBudgetDialog } = useCampaignManagementActions()
  return (
    <CampaignRowActions
      actionLoading={actionLoading}
      campaign={row.original}
      onAction={handleAction}
      onOpenBiddingDialog={openCampaignBiddingDialog}
      onOpenBudgetDialog={openCampaignBudgetDialog}
    />
  )
}

function GroupNameHeader({ column }: HeaderContext<CampaignGroup, unknown>) {
  return <DataTableColumnHeader column={column} title="Name" />
}

function GroupNameCell({ row }: CellContext<CampaignGroup, unknown>) {
  return <span className="font-medium hover:underline">{row.getValue('name')}</span>
}

function GroupStatusHeader({ column }: HeaderContext<CampaignGroup, unknown>) {
  return <DataTableColumnHeader column={column} title="Status" />
}

function GroupStatusCell({ row }: CellContext<CampaignGroup, unknown>) {
  return getStatusBadge(row.getValue('status'))
}

function GroupBudgetHeader({ column }: HeaderContext<CampaignGroup, unknown>) {
  return <DataTableColumnHeader column={column} title="Budget" />
}

function GroupBudgetCell({ row }: CellContext<CampaignGroup, unknown>) {
  const budget = row.getValue('totalBudget') as number | undefined
  if (budget === undefined) {
    return <span className="text-muted-foreground">-</span>
  }
  return <span>{formatMoney(budget, row.original.currency)} total</span>
}

function GroupActionsHeader() {
  return <div className="text-right">Actions</div>
}

function GroupActionsCell({ row }: CellContext<CampaignGroup, unknown>) {
  const { actionLoading, handleGroupAction, openGroupBudgetDialog } = useCampaignManagementActions()
  return (
    <CampaignGroupRowActions
      actionLoading={actionLoading}
      group={row.original}
      onAction={handleGroupAction}
      onOpenBudgetDialog={openGroupBudgetDialog}
    />
  )
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CampaignManagementCard({
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
}: Props) {
  const { selectedClientId } = useClientContext()
  const { user } = useAuth()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const router = useRouter()
  const listCampaigns = useAction(adsCampaignsApi.listCampaigns)
  const updateCampaign = useAction(adsCampaignsApi.updateCampaign)
  const listCampaignGroups = useAction(adsCampaignGroupsApi.listCampaignGroups)
  const updateCampaignGroup = useAction(adsCampaignGroupsApi.updateCampaignGroup)

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [biddingDialogOpen, setBiddingDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<CampaignGroup | null>(null)
  const [newBudget, setNewBudget] = useState('')
  const [newBidding, setNewBidding] = useState<BiddingDraft>({
    type: '',
    value: '',
  })
  const [view, setView] = useState<CampaignManagementView>('campaigns')
  const [groups, setGroups] = useState<CampaignGroup[]>([])
  const [groupsLoading, setGroupsLoading] = useState(false)

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
    setSelectedGroup(null)
    setSelectedCampaign(campaign)
    setNewBudget(campaign.budget?.toString() || '')
    setBudgetDialogOpen(true)
  }, [])

  const openGroupBudgetDialog = useCallback((group: CampaignGroup) => {
    setSelectedCampaign(null)
    setSelectedGroup(group)
    setNewBudget(group.totalBudget?.toString() || '')
    setBudgetDialogOpen(true)
  }, [])

  const openCampaignBiddingDialog = useCallback((campaign: Campaign) => {
    setSelectedGroup(null)
    setSelectedCampaign(campaign)
    setNewBidding({
      type: campaign.biddingStrategy?.type || '',
      value: (campaign.biddingStrategy?.targetCpa || campaign.biddingStrategy?.targetRoas || campaign.biddingStrategy?.bidCeiling || 0).toString(),
    })
    setBiddingDialogOpen(true)
  }, [])

  const fetchCampaigns = useCallback(async () => {
    if (!isConnected || setupRequired) return

    setLoading(true)
    if (!workspaceId) {
      setLoading(false)
      return
    }

    await listCampaigns({
      workspaceId,
      providerId: providerId as 'google' | 'tiktok' | 'linkedin' | 'facebook',
      clientId: selectedClientId ?? null,
    })
      .then((result) => {
        setCampaigns(Array.isArray(result) ? (result as Campaign[]) : [])
      })
      .catch((error) => {
        logError(error, 'CampaignManagementCard:fetchCampaigns')
        toast({
          title: 'Error',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isConnected, listCampaigns, providerId, selectedClientId, setupRequired, workspaceId])

  const fetchGroups = useCallback(async () => {
    if (!isConnected || setupRequired || providerId !== 'linkedin') return
    setGroupsLoading(true)

    if (!workspaceId) {
      setGroupsLoading(false)
      return
    }

    await listCampaignGroups({
      workspaceId,
      providerId: 'linkedin',
      clientId: selectedClientId ?? null,
    })
      .then((result) => {
        setGroups(Array.isArray(result) ? (result as CampaignGroup[]) : [])
      })
      .catch((error) => {
        logError(error, 'CampaignManagementCard:fetchGroups')
        console.error('Fetch groups error:', error)
      })
      .finally(() => {
        setGroupsLoading(false)
      })
  }, [isConnected, listCampaignGroups, providerId, selectedClientId, setupRequired, workspaceId])

  const handleRefresh = useCallback(() => {
    if (view === 'groups') {
      void fetchGroups()
      return
    }

    void fetchCampaigns()
  }, [fetchCampaigns, fetchGroups, view])

  // Auto-load campaigns on mount when connected
  useEffect(() => {
    if (!isConnected || setupRequired) return

    const frameId = requestAnimationFrame(() => {
      void fetchCampaigns()
      if (providerId === 'linkedin') {
        void fetchGroups()
      }
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [fetchCampaigns, fetchGroups, isConnected, providerId, setupRequired])

  const openInsightsPage = useCallback(
    (campaignOrGroupId: string, name: string) => {
      const params = new URLSearchParams({ startDate, endDate })
      if (selectedClientId) params.set('clientId', selectedClientId)
      params.set('campaignName', name)

      router.push(`/dashboard/ads/campaigns/${providerId}/${campaignOrGroupId}?${params.toString()}`)
    },
    [endDate, providerId, router, selectedClientId, startDate]
  )

  const handleAction = useCallback(async (campaignId: string, action: 'enable' | 'pause' | 'remove') => {
    setActionLoading(campaignId)

    if (!workspaceId) {
      toast({
        title: 'Error',
        description: 'Sign in required',
        variant: 'destructive',
      })
      setActionLoading(null)
      return
    }

    await updateCampaign({
      workspaceId,
      providerId: providerId as 'google' | 'tiktok' | 'linkedin' | 'facebook',
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
        logError(error, 'CampaignManagementCard:handleAction')
        toast({
          title: 'Error',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setActionLoading(null)
      })
  }, [fetchCampaigns, onRefresh, providerId, selectedClientId, updateCampaign, workspaceId])

  const handleGroupAction = useCallback(async (groupId: string, action: 'enable' | 'pause') => {
    setActionLoading(groupId)

    if (!workspaceId) {
      toast({
        title: 'Error',
        description: 'Sign in required',
        variant: 'destructive',
      })
      setActionLoading(null)
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
        logError(error, 'CampaignManagementCard:handleGroupAction')
        toast({
          title: 'Error',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setActionLoading(null)
      })
  }, [fetchGroups, onRefresh, selectedClientId, updateCampaignGroup, workspaceId])

  const handleBudgetUpdate = useCallback(async () => {
    const isGroup = view === 'groups'
    const targetId = isGroup ? selectedGroup?.id : selectedCampaign?.id
    if (!targetId || !newBudget) return

    setActionLoading(targetId)

    const parsedBudget = parseFloat(newBudget)

    if (!workspaceId) {
      toast({
        title: 'Error',
        description: 'Sign in required',
        variant: 'destructive',
      })
      setActionLoading(null)
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
          providerId: providerId as 'google' | 'tiktok' | 'linkedin' | 'facebook',
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

        setBudgetDialogOpen(false)
        setSelectedCampaign(null)
        setSelectedGroup(null)
        setNewBudget('')
        if (isGroup) {
          void fetchGroups()
        } else {
          void fetchCampaigns()
        }
        onRefresh?.()
      })
      .catch((error) => {
        logError(error, 'CampaignManagementCard:handleBudgetUpdate')
        toast({
          title: 'Error',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setActionLoading(null)
      })
  }, [selectedCampaign, selectedGroup, newBudget, providerId, fetchCampaigns, fetchGroups, onRefresh, selectedClientId, view, workspaceId, updateCampaign, updateCampaignGroup])

  const handleBiddingUpdate = useCallback(async () => {
    if (!selectedCampaign || !newBidding.type) return

    setActionLoading(selectedCampaign.id)

    if (!workspaceId) {
      toast({
        title: 'Error',
        description: 'Sign in required',
        variant: 'destructive',
      })
      setActionLoading(null)
      return
    }

    await updateCampaign({
      workspaceId,
      providerId: providerId as 'google' | 'tiktok' | 'linkedin' | 'facebook',
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

        setBiddingDialogOpen(false)
        setSelectedCampaign(null)
        void fetchCampaigns()
        onRefresh?.()
      })
      .catch((error) => {
        logError(error, 'CampaignManagementCard:handleBiddingUpdate')
        toast({
          title: 'Error',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setActionLoading(null)
      })
  }, [selectedCampaign, newBidding, providerId, fetchCampaigns, onRefresh, selectedClientId, workspaceId, updateCampaign])

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

  // Campaign columns
  const campaignColumns: ColumnDef<Campaign>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
          header: CampaignNameHeader,
          cell: CampaignNameCell,
      },
      {
        accessorKey: 'status',
          header: CampaignStatusHeader,
          cell: CampaignStatusCell,
      },
      {
        id: 'runs',
        header: 'Runs',
          cell: CampaignRunsCell,
      },
      {
        accessorKey: 'budget',
          header: CampaignBudgetHeader,
          cell: CampaignBudgetCell,
      },
      {
        accessorKey: 'objective',
          header: CampaignObjectiveHeader,
          cell: CampaignObjectiveCell,
      },
      {
        id: 'actions',
          header: CampaignActionsHeader,
          cell: CampaignActionsCell,
      },
    ],
      []
  )

  // Group columns
  const groupColumns: ColumnDef<CampaignGroup>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: GroupNameHeader,
        cell: GroupNameCell,
      },
      {
        accessorKey: 'status',
        header: GroupStatusHeader,
        cell: GroupStatusCell,
      },
      {
        accessorKey: 'totalBudget',
        header: GroupBudgetHeader,
        cell: GroupBudgetCell,
      },
      {
        id: 'actions',
        header: GroupActionsHeader,
        cell: GroupActionsCell,
      },
    ],
    []
  )

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
        onBiddingChange={setNewBidding}
        onBiddingOpenChange={setBiddingDialogOpen}
        onBudgetChange={setNewBudget}
        onBudgetOpenChange={setBudgetDialogOpen}
        onRefresh={handleRefresh}
        onRowClick={openInsightsPage}
        onSubmitBidding={handleBiddingUpdate}
        onSubmitBudget={handleBudgetUpdate}
        onViewChange={setView}
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
