'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pause, Play, Trash2, DollarSign, RefreshCw, Settings2, Calendar, TrendingUp, Clock } from 'lucide-react'

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
import { useClientContext } from '@/contexts/client-context'
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

function formatCampaignDateRange(startTime?: string, stopTime?: string): string {
  const start = startTime ? new Date(startTime) : null
  const stop = stopTime ? new Date(stopTime) : null

  const hasStart = Boolean(start && !Number.isNaN(start.getTime()))
  const hasStop = Boolean(stop && !Number.isNaN(stop.getTime()))

  if (!hasStart && !hasStop) return '—'
  if (hasStart && !hasStop) return `Starts ${start!.toLocaleDateString()}`
  if (!hasStart && hasStop) return `Ends ${stop!.toLocaleDateString()}`
  return `${start!.toLocaleDateString()} → ${stop!.toLocaleDateString()}`
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
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [newBudget, setNewBudget] = useState('')
  const [newBidding, setNewBidding] = useState({
    type: '',
    value: '',
  })

  const startDate = useMemo(() => toIsoDateOnly(dateRange.start), [dateRange.start])
  const endDate = useMemo(() => toIsoDateOnly(dateRange.end), [dateRange.end])

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

  // Auto-load campaigns on mount when connected
  useEffect(() => {
    if (isConnected) {
      void fetchCampaigns()
    }
  }, [fetchCampaigns, isConnected])

  const openInsightsPage = useCallback(
    (campaign: Campaign) => {
      const params = new URLSearchParams({ startDate, endDate })
      if (selectedClientId) params.set('clientId', selectedClientId)
      params.set('campaignName', campaign.name)
      if (campaign.startTime) params.set('campaignStartTime', campaign.startTime)
      if (campaign.stopTime) params.set('campaignStopTime', campaign.stopTime)

      router.push(`/dashboard/ads/campaigns/${providerId}/${campaign.id}?${params.toString()}`)
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

  const handleBudgetUpdate = useCallback(async () => {
    if (!selectedCampaign || !newBudget) return
    
    setActionLoading(selectedCampaign.id)
    try {
      const payload: Record<string, unknown> = {
        providerId,
        campaignId: selectedCampaign.id,
        action: 'updateBudget',
        budget: parseFloat(newBudget),
      }
      if (selectedClientId) payload.clientId = selectedClientId
      const response = await fetch('/api/integrations/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `${selectedCampaign.id}-budget-${Date.now()}` },
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
      setNewBudget('')
      fetchCampaigns()
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
  }, [selectedCampaign, newBudget, providerId, fetchCampaigns, onRefresh, selectedClientId])

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
    const s = status.toLowerCase()
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
          <div>
            <CardTitle className="text-lg">Campaign Management</CardTitle>
            <CardDescription>Manage {providerName} campaigns</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">
              Loading campaigns...
            </p>
          ) : campaigns.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No campaigns found for this provider.
            </p>
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
                      onClick={() => openInsightsPage(campaign)}
                    >
                      <TableCell className="font-medium hover:underline">{campaign.name}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatCampaignDateRange(campaign.startTime, campaign.stopTime)}
                      </TableCell>
                      <TableCell>
                        {campaign.budget !== undefined ? (
                          <span>
                            {new Intl.NumberFormat(undefined, {
                              style: 'currency',
                              currency: campaign.currency || 'USD',
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }).format(campaign.budget)}
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
                      <TableCell className="text-right space-x-2">
                        {isActive(campaign.status) ? (
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
                        ) : (
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
                        )}
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
                          title="Bidding Strategy"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCampaign(campaign)
                            setScheduleDialogOpen(true)
                          }}
                          disabled={actionLoading === campaign.id}
                          title="Ad Schedule"
                        >
                          <Calendar className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            void handleAction(campaign.id, 'remove')
                          }}
                          disabled={actionLoading === campaign.id}
                          title="Remove Campaign"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
              Update the budget for {selectedCampaign?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="budget">New Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="Enter new budget amount"
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

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ad Schedule</DialogTitle>
            <DialogDescription>
              View delivery schedule for {selectedCampaign?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedCampaign?.schedule && selectedCampaign.schedule.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 font-semibold text-sm pb-2 border-b">
                  <span>Day</span>
                  <span>Start</span>
                  <span>End</span>
                </div>
                {selectedCampaign.schedule.map((s, i) => (
                  <div key={i} className="grid grid-cols-3 text-sm py-1 border-b border-muted">
                    <span className="capitalize">{s.dayOfWeek.toLowerCase()}</span>
                    <span>{s.startHour}:00</span>
                    <span>{s.endHour}:00</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <Clock className="h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground text-sm">No custom schedule configured.<br/>Ad will run 24/7.</p>
              </div>
            )}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border text-xs text-muted-foreground flex gap-2">
              <Settings2 className="h-4 w-4 shrink-0" />
              <p>Schedule modification is currently limited to the native ad platform for safety. Advanced scheduling controls coming soon.</p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setScheduleDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
