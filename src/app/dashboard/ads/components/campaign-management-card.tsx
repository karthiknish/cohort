'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pause, Play, Trash2, DollarSign, RefreshCw, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { useClientContext } from '@/contexts/client-context'
import { formatMoney, normalizeCurrencyCode, getCurrencyInfo, isSupportedCurrency } from '@/constants/currencies'
import type { DateRange } from './date-range-picker'

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


// =============================================================================
// COMPONENT
// =============================================================================

export function CampaignManagementCard({ providerId, providerName, isConnected, dateRange, onRefresh }: Props) {
  const { selectedClientId } = useClientContext()
  const router = useRouter()
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
      const params = new URLSearchParams({ providerId })
      if (selectedClientId) params.set('clientId', selectedClientId)
      const response = await fetch(`/api/integrations/campaigns?${params.toString()}`)
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || error.message || 'Failed to fetch campaigns')
      }
      const payload: unknown = await response.json().catch(() => ({}))
      const payloadRecord = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null
      const data = payloadRecord && 'data' in payloadRecord ? payloadRecord.data : payload
      const dataRecord = data && typeof data === 'object' ? (data as Record<string, unknown>) : null
      const campaignsRaw = dataRecord?.campaigns
      setCampaigns(Array.isArray(campaignsRaw) ? (campaignsRaw as Campaign[]) : [])
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load campaigns',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [providerId, isConnected, selectedClientId])

  const fetchGroups = useCallback(async () => {
    if (!isConnected || providerId !== 'linkedin') return
    setGroupsLoading(true)
    try {
      const params = new URLSearchParams({ providerId })
      if (selectedClientId) params.set('clientId', selectedClientId)
      const response = await fetch(`/api/integrations/campaign-groups?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch campaign groups')
      const data = await response.json()
      setGroups(data.groups || [])
    } catch (error) {
      console.error('Fetch groups error:', error)
    } finally {
      setGroupsLoading(false)
    }
  }, [providerId, isConnected, selectedClientId])

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
      const payload: Record<string, unknown> = { providerId, campaignId, action }
      if (selectedClientId) payload.clientId = selectedClientId
      const response = await fetch('/api/integrations/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `${campaignId}-${action}-${Date.now()}` },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || error.message || 'Action failed')
      }

      toast({
        title: 'Success',
        description: `Campaign ${action}d successfully`,
      })

      fetchCampaigns()
      onRefresh?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${action} campaign`,
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }, [providerId, fetchCampaigns, onRefresh, selectedClientId])

  const handleGroupAction = useCallback(async (groupId: string, action: 'enable' | 'pause') => {
    setActionLoading(groupId)
    try {
      const payload: Record<string, unknown> = { providerId, campaignGroupId: groupId, action }
      if (selectedClientId) payload.clientId = selectedClientId
      const response = await fetch('/api/integrations/campaign-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error || error.message || 'Action failed')
      }

      toast({
        title: 'Success',
        description: `Campaign Group ${action}d successfully`,
      })

      fetchGroups()
      onRefresh?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${action} group`,
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }, [providerId, fetchGroups, onRefresh, selectedClientId])

  const handleBudgetUpdate = useCallback(async () => {
    const isGroup = view === 'groups'
    const targetId = isGroup ? selectedGroup?.id : selectedCampaign?.id
    if (!targetId || !newBudget) return

    setActionLoading(targetId)
    try {
      const payload: Record<string, unknown> = {
        providerId,
        action: 'updateBudget',
        budget: parseFloat(newBudget),
      }
      if (isGroup) payload.campaignGroupId = targetId
      else payload.campaignId = targetId

      if (selectedClientId) payload.clientId = selectedClientId

      const endpoint = isGroup ? '/api/integrations/campaign-groups' : '/api/integrations/campaigns'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Budget update failed')
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
        description: error instanceof Error ? error.message : 'Failed to update budget',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }, [selectedCampaign, selectedGroup, newBudget, providerId, fetchCampaigns, fetchGroups, onRefresh, selectedClientId, view])

  const handleBiddingUpdate = useCallback(async () => {
    if (!selectedCampaign || !newBidding.type) return

    setActionLoading(selectedCampaign.id)
    try {
      const payload: Record<string, unknown> = {
        providerId,
        campaignId: selectedCampaign.id,
        action: 'updateBidding',
        biddingType: newBidding.type,
        biddingValue: parseFloat(newBidding.value || '0'),
      }
      if (selectedClientId) payload.clientId = selectedClientId
      const response = await fetch('/api/integrations/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `${selectedCampaign.id}-bidding-${Date.now()}` },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Bidding update failed')
      }

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
        description: error instanceof Error ? error.message : 'Failed to update bidding',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }, [selectedCampaign, newBidding, providerId, fetchCampaigns, onRefresh, selectedClientId])

  const getStatusBadge = (status: string) => {
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

  const isActive = (status: string) => {
    const s = (status || '').toLowerCase()
    return s === 'enabled' || s === 'enable' || s === 'active'
  }

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
            <div className="max-h-[420px] overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow
                      key={group.id}
                      className="cursor-pointer"
                      onClick={() => openInsightsPage(group.id, group.name)}
                    >
                      <TableCell className="font-medium hover:underline">{group.name}</TableCell>
                      <TableCell>{getStatusBadge(group.status)}</TableCell>
                      <TableCell>
                        {group.totalBudget !== undefined ? (
                          <span>{formatMoney(group.totalBudget, group.currency)} total</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="max-h-[420px] overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Runs</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Objective</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow
                      key={campaign.id}
                      className="cursor-pointer"
                      onClick={() => openInsightsPage(campaign.id, campaign.name)}
                    >
                      <TableCell className="font-medium hover:underline">{campaign.name}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatCampaignDateRange(campaign.startTime, campaign.stopTime)}
                      </TableCell>
                      <TableCell>
                        {campaign.budget !== undefined ? (
                          <span>
                            {formatMoney(campaign.budget, campaign.currency)}
                            /{campaign.budgetType || 'day'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize text-sm text-muted-foreground">
                          {campaign.objective?.toLowerCase().replace(/_/g, ' ') || '-'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
