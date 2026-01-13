'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from 'convex/react'
import { Pause, Play, Trash2, DollarSign, RefreshCw, TrendingUp } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { useClientContext } from '@/contexts/client-context'
import { useAuth } from '@/contexts/auth-context'
import { formatMoney, normalizeCurrencyCode, getCurrencyInfo, isSupportedCurrency } from '@/constants/currencies'
import type { DateRange } from './date-range-picker'
import { asErrorMessage } from '@/lib/convex-errors'
import { adsCampaignGroupsApi, adsCampaignsApi } from '@/lib/convex-api'

// =============================================================================
// TYPES
// =============================================================================

type Campaign = {
  id: string
  name: string
  providerId: string
  status: string
  budget?: number
  budgetType?: string
  currency?: string
  objective?: string
  startTime?: string
  stopTime?: string
  biddingStrategy?: {
    type: string
    targetCpa?: number
    targetRoas?: number
    bidCeiling?: number
  }
  schedule?: Array<{
    dayOfWeek: string
    startHour: number
    endHour: number
  }>
}

type CampaignGroup = {
  id: string
  name: string
  status: string
  totalBudget?: number
  currency?: string
}

type Props = {
  providerId: string
  providerName: string
  isConnected: boolean
  dateRange: DateRange
  onRefresh?: () => void
}

function toIsoDateOnly(date: Date): string {
  return date.toISOString().split('T')[0]
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
    if (start! > now) {
      return `Starts ${formatRelativeDate(start!)}`
    }
    return `Since ${formatRelativeDate(start!)}`
  }

  if (!hasStart && hasStop) {
    if (stop! > now) {
      return `Until ${formatRelativeDate(stop!)}`
    }
    return `Ended ${formatRelativeDate(stop!)}`
  }

  // Both dates present
  const startStr = start!.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const endStr = stop!.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

  if (start! > now) {
    return `${startStr} - ${endStr}`
  }
  if (stop! < now) {
    return `Ended ${formatRelativeDate(stop!)}`
  }
  return `${startStr} - ${endStr}`
}

function getStatusBadge(status: string) {
  const statusLower = status.toLowerCase()
  if (statusLower === 'enabled' || statusLower === 'enable' || statusLower === 'active') {
    return <Badge variant="default" className="bg-green-500">Active</Badge>
  }
  if (statusLower === 'paused' || statusLower === 'disable') {
    return <Badge variant="secondary">Paused</Badge>
  }
  if (statusLower === 'removed' || statusLower === 'archived' || statusLower === 'delete') {
    return <Badge variant="destructive">Removed</Badge>
  }
  return <Badge variant="outline">{status}</Badge>
}

function isActive(status: string) {
  const s = (status || '').toLowerCase()
  return s === 'enabled' || s === 'enable' || s === 'active'
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CampaignManagementCard({ providerId, providerName, isConnected, dateRange, onRefresh }: Props) {
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
  const [newBidding, setNewBidding] = useState({
    type: '',
    value: '',
  })
  const [view, setView] = useState<'campaigns' | 'groups'>('campaigns')
  const [groups, setGroups] = useState<CampaignGroup[]>([])
  const [groupsLoading, setGroupsLoading] = useState(false)

  const startDate = useMemo(() => toIsoDateOnly(dateRange.start), [dateRange.start])
  const endDate = useMemo(() => toIsoDateOnly(dateRange.end), [dateRange.end])

  const selectedCurrencyCode = useMemo(
    () => normalizeCurrencyCode(selectedCampaign?.currency),
    [selectedCampaign?.currency]
  )
  const selectedCurrencyInfo = useMemo(
    () => (isSupportedCurrency(selectedCurrencyCode) ? getCurrencyInfo(selectedCurrencyCode) : null),
    [selectedCurrencyCode]
  )
  const selectedCurrencyLabel = useMemo(
    () => (selectedCurrencyInfo ? `${selectedCurrencyInfo.symbol} ${selectedCurrencyCode}` : selectedCurrencyCode),
    [selectedCurrencyInfo, selectedCurrencyCode]
  )

  const fetchCampaigns = useCallback(async () => {
    if (!isConnected) return

    setLoading(true)
    try {
      if (!workspaceId) {
        return
      }

      const result = await listCampaigns({
        workspaceId,
        providerId: providerId as any,
        clientId: selectedClientId ?? null,
      })

      setCampaigns(Array.isArray(result) ? (result as Campaign[]) : [])
    } catch (error) {
      toast({
        title: 'Error',
        description: asErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [isConnected, listCampaigns, providerId, selectedClientId, workspaceId])

  const fetchGroups = useCallback(async () => {
    if (!isConnected || providerId !== 'linkedin') return
    setGroupsLoading(true)
    try {
      if (!workspaceId) {
        throw new Error('Sign in required')
      }

      const result = await listCampaignGroups({
        workspaceId,
        providerId: 'linkedin',
        clientId: selectedClientId ?? null,
      })

      setGroups(Array.isArray(result) ? (result as CampaignGroup[]) : [])
    } catch (error) {
      console.error('Fetch groups error:', error)
    } finally {
      setGroupsLoading(false)
    }
  }, [isConnected, listCampaignGroups, providerId, selectedClientId, workspaceId])

  // Auto-load campaigns on mount when connected
  useEffect(() => {
    if (isConnected) {
      void fetchCampaigns()
      if (providerId === 'linkedin') void fetchGroups()
    }
  }, [fetchCampaigns, fetchGroups, isConnected, providerId])

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
    try {
      if (!workspaceId) {
        throw new Error('Sign in required')
      }

      await updateCampaign({
        workspaceId,
        providerId: providerId as any,
        clientId: selectedClientId ?? null,
        campaignId,
        action,
      })

      toast({
        title: 'Success',
        description: `Campaign ${action}d successfully`,
      })

      fetchCampaigns()
      onRefresh?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: asErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }, [fetchCampaigns, onRefresh, providerId, selectedClientId, updateCampaign, workspaceId])

  const handleGroupAction = useCallback(async (groupId: string, action: 'enable' | 'pause') => {
    setActionLoading(groupId)
    try {
      if (!workspaceId) {
        throw new Error('Sign in required')
      }

      await updateCampaignGroup({
        workspaceId,
        providerId: 'linkedin',
        clientId: selectedClientId ?? null,
        campaignGroupId: groupId,
        action,
      })

      toast({
        title: 'Success',
        description: `Campaign Group ${action}d successfully`,
      })

      fetchGroups()
      onRefresh?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: asErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }, [fetchGroups, onRefresh, selectedClientId, updateCampaignGroup, workspaceId])

  const handleBudgetUpdate = useCallback(async () => {
    const isGroup = view === 'groups'
    const targetId = isGroup ? selectedGroup?.id : selectedCampaign?.id
    if (!targetId || !newBudget) return

    setActionLoading(targetId)
    try {
      const parsedBudget = parseFloat(newBudget)

      if (!workspaceId) {
        throw new Error('Sign in required')
      }

      if (isGroup) {
        await updateCampaignGroup({
          workspaceId,
          providerId: 'linkedin',
          clientId: selectedClientId ?? null,
          campaignGroupId: targetId,
          action: 'updateBudget',
          budget: parsedBudget,
        })
      } else {
        await updateCampaign({
          workspaceId,
          providerId: providerId as any,
          clientId: selectedClientId ?? null,
          campaignId: targetId,
          action: 'updateBudget',
          budget: parsedBudget,
        })
      }


      toast({
        title: 'Success',
        description: 'Budget updated successfully',
      })

      setBudgetDialogOpen(false)
      setSelectedCampaign(null)
      setSelectedGroup(null)
      setNewBudget('')
      if (isGroup) fetchGroups()
      else fetchCampaigns()
      onRefresh?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: asErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }, [selectedCampaign, selectedGroup, newBudget, providerId, fetchCampaigns, fetchGroups, onRefresh, selectedClientId, view, workspaceId, updateCampaign, updateCampaignGroup])

  const handleBiddingUpdate = useCallback(async () => {
    if (!selectedCampaign || !newBidding.type) return

    setActionLoading(selectedCampaign.id)
    try {
      if (!workspaceId) {
        throw new Error('Sign in required')
      }

      await updateCampaign({
        workspaceId,
        providerId: providerId as any,
        clientId: selectedClientId ?? null,
        campaignId: selectedCampaign.id,
        action: 'updateBidding',
        biddingType: newBidding.type,
        biddingValue: parseFloat(newBidding.value || '0'),
      })

      toast({
        title: 'Success',
        description: 'Bidding strategy updated successfully',
      })

      setBiddingDialogOpen(false)
      setSelectedCampaign(null)
      fetchCampaigns()
      onRefresh?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: asErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }, [selectedCampaign, newBidding, providerId, fetchCampaigns, onRefresh, selectedClientId, workspaceId, updateCampaign])

  // Campaign columns
  const campaignColumns: ColumnDef<Campaign>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <span className="font-medium hover:underline">{row.getValue('name')}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => getStatusBadge(row.getValue('status')),
      },
      {
        id: 'runs',
        header: 'Runs',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatCampaignDateRange(row.original.startTime, row.original.stopTime)}
          </span>
        ),
      },
      {
        accessorKey: 'budget',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Budget" />
        ),
        cell: ({ row }) => {
          const budget = row.getValue('budget') as number | undefined
          if (budget === undefined) {
            return <span className="text-muted-foreground">-</span>
          }
          return (
            <span>
              {formatMoney(budget, row.original.currency)}
              /{row.original.budgetType || 'day'}
            </span>
          )
        },
      },
      {
        accessorKey: 'objective',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Objective" />
        ),
        cell: ({ row }) => {
          const objective = row.getValue('objective') as string | undefined
          return (
            <span className="capitalize text-sm text-muted-foreground">
              {objective?.toLowerCase().replace(/_/g, ' ') || '-'}
            </span>
          )
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const campaign = row.original
          return (
            <TooltipProvider>
              <div className="flex items-center justify-end gap-1">
                {isActive(campaign.status) ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          void handleAction(campaign.id, 'pause')
                        }}
                        disabled={actionLoading === campaign.id}
                      >
                        <Pause className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pause campaign</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          void handleAction(campaign.id, 'enable')
                        }}
                        disabled={actionLoading === campaign.id}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enable campaign</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCampaign(campaign)
                        setNewBudget(campaign.budget?.toString() || '')
                        setBudgetDialogOpen(true)
                      }}
                      disabled={actionLoading === campaign.id}
                    >
                      <DollarSign className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Update budget</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCampaign(campaign)
                        setNewBidding({
                          type: campaign.biddingStrategy?.type || '',
                          value: (campaign.biddingStrategy?.targetCpa || campaign.biddingStrategy?.targetRoas || campaign.biddingStrategy?.bidCeiling || 0).toString(),
                        })
                        setBiddingDialogOpen(true)
                      }}
                      disabled={actionLoading === campaign.id}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Bidding strategy</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        void handleAction(campaign.id, 'remove')
                      }}
                      disabled={actionLoading === campaign.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove campaign</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          )
        },
      },
    ],
    [actionLoading, handleAction]
  )

  // Group columns
  const groupColumns: ColumnDef<CampaignGroup>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => (
          <span className="font-medium hover:underline">{row.getValue('name')}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => getStatusBadge(row.getValue('status')),
      },
      {
        accessorKey: 'totalBudget',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Budget" />
        ),
        cell: ({ row }) => {
          const budget = row.getValue('totalBudget') as number | undefined
          if (budget === undefined) {
            return <span className="text-muted-foreground">-</span>
          }
          return <span>{formatMoney(budget, row.original.currency)} total</span>
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const group = row.original
          return (
            <div className="flex items-center justify-end gap-1">
              {isActive(group.status) ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    void handleGroupAction(group.id, 'pause')
                  }}
                  disabled={actionLoading === group.id}
                >
                  <Pause className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    void handleGroupAction(group.id, 'enable')
                  }}
                  disabled={actionLoading === group.id}
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedGroup(group)
                  setNewBudget(group.totalBudget?.toString() || '')
                  setBudgetDialogOpen(true)
                }}
                disabled={actionLoading === group.id}
              >
                <DollarSign className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [actionLoading, handleGroupAction]
  )

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campaign Management</CardTitle>
          <CardDescription>Connect {providerName} to manage campaigns</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex-1">
            <CardTitle className="text-lg">Campaign Management</CardTitle>
            <CardDescription>Manage {providerName} {providerId === 'linkedin' ? (view === 'groups' ? 'campaign groups' : 'campaigns') : 'campaigns'}</CardDescription>
            {providerId === 'linkedin' && (
              <Tabs value={view} onValueChange={(v) => setView(v as 'campaigns' | 'groups')} className="mt-4">
                <TabsList className="grid w-[300px] grid-cols-2">
                  <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                  <TabsTrigger value="groups">Group (Ad Sets)</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => view === 'groups' ? fetchGroups() : fetchCampaigns()} disabled={loading || groupsLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${(loading || groupsLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {(loading || groupsLoading) ? (
            <p className="text-muted-foreground text-sm">
              Loading {view === 'groups' ? 'groups' : 'campaigns'}...
            </p>
          ) : (view === 'groups' ? groups.length === 0 : campaigns.length === 0) ? (
            <p className="text-muted-foreground text-sm">
              No {view === 'groups' ? 'groups' : 'campaigns'} found for this provider.
            </p>
          ) : view === 'groups' ? (
            <DataTable
              columns={groupColumns}
              data={groups}
              showPagination={false}
              maxHeight={420}
              onRowClick={(row) => openInsightsPage(row.id, row.name)}
              rowClassName="cursor-pointer"
              getRowId={(row) => row.id}
            />
          ) : (
            <DataTable
              columns={campaignColumns}
              data={campaigns}
              showPagination={false}
              maxHeight={420}
              onRowClick={(row) => openInsightsPage(row.id, row.name)}
              rowClassName="cursor-pointer"
              getRowId={(row) => row.id}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Budget</DialogTitle>
            <DialogDescription>
              Update the budget for {selectedGroup?.name || selectedCampaign?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="budget">New Budget ({selectedCurrencyLabel})</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder={`Enter new budget amount (${selectedCurrencyCode})`}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBudgetDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBudgetUpdate} disabled={actionLoading !== null}>
              Update Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={biddingDialogOpen} onOpenChange={setBiddingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bidding Strategy</DialogTitle>
            <DialogDescription>
              Update bidding strategy for {selectedCampaign?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="biddingType">Strategy Type</Label>
              <Input
                id="biddingType"
                value={newBidding.type}
                onChange={(e) => setNewBidding({ ...newBidding, type: e.target.value })}
                placeholder="e.g. TARGET_CPA, MAXIMIZE_CONVERSIONS"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="biddingValue">Target Value / Bid Ceiling</Label>
              <Input
                id="biddingValue"
                type="number"
                step="0.01"
                value={newBidding.value}
                onChange={(e) => setNewBidding({ ...newBidding, value: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBiddingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBiddingUpdate} disabled={actionLoading !== null}>
              Update Bidding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  )
}
