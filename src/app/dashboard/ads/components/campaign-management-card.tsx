'use client'

import { useCallback, useState } from 'react'
import { Pause, Play, Trash2, DollarSign, RefreshCw } from 'lucide-react'

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
  objective?: string
}

type Props = {
  providerId: string
  providerName: string
  isConnected: boolean
  onRefresh?: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CampaignManagementCard({ providerId, providerName, isConnected, onRefresh }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [newBudget, setNewBudget] = useState('')

  const fetchCampaigns = useCallback(async () => {
    if (!isConnected) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/integrations/campaigns?providerId=${providerId}`)
      if (!response.ok) throw new Error('Failed to fetch campaigns')
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load campaigns',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [providerId, isConnected])

  const handleAction = useCallback(async (campaignId: string, action: 'enable' | 'pause' | 'remove') => {
    setActionLoading(campaignId)
    try {
      const response = await fetch('/api/integrations/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `${campaignId}-${action}-${Date.now()}` },
        body: JSON.stringify({ providerId, campaignId, action }),
      })
      
      if (!response.ok) throw new Error('Action failed')
      
      toast({
        title: 'Success',
        description: `Campaign ${action}d successfully`,
      })
      
      fetchCampaigns()
      onRefresh?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${action} campaign`,
        variant: 'destructive',
      })
    } finally {
      setActionLoading(null)
    }
  }, [providerId, fetchCampaigns, onRefresh])

  const handleBudgetUpdate = useCallback(async () => {
    if (!selectedCampaign || !newBudget) return
    
    setActionLoading(selectedCampaign.id)
    try {
      const response = await fetch('/api/integrations/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': `${selectedCampaign.id}-budget-${Date.now()}` },
        body: JSON.stringify({
          providerId,
          campaignId: selectedCampaign.id,
          action: 'updateBudget',
          budget: parseFloat(newBudget),
        }),
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
  }, [selectedCampaign, newBudget, providerId, fetchCampaigns, onRefresh])

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
            Load Campaigns
          </Button>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Click "Load Campaigns" to view and manage your campaigns.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Objective</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell>
                      {campaign.budget !== undefined ? (
                        <span>${campaign.budget.toFixed(2)}/{campaign.budgetType || 'day'}</span>
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
                          onClick={() => handleAction(campaign.id, 'pause')}
                          disabled={actionLoading === campaign.id}
                        >
                          <Pause className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(campaign.id, 'enable')}
                          disabled={actionLoading === campaign.id}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCampaign(campaign)
                          setNewBudget(campaign.budget?.toString() || '')
                          setBudgetDialogOpen(true)
                        }}
                        disabled={actionLoading === campaign.id}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleAction(campaign.id, 'remove')}
                        disabled={actionLoading === campaign.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
    </>
  )
}
