'use client'

import { useAction } from 'convex/react'
import { useCallback, useState } from 'react'

import { adsCampaignsApi } from '@/lib/convex-api'
import { asErrorMessage } from '@/lib/convex-errors'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { notifyFailure } from '@/lib/notifications'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { FormField } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { toast } from '@/shared/ui/use-toast'

const META_OBJECTIVES = [
  { value: 'OUTCOME_TRAFFIC', label: 'Traffic' },
  { value: 'OUTCOME_LEADS', label: 'Leads' },
  { value: 'OUTCOME_SALES', label: 'Sales' },
  { value: 'OUTCOME_AWARENESS', label: 'Awareness' },
  { value: 'OUTCOME_ENGAGEMENT', label: 'Engagement' },
] as const

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function CreateMetaCampaignDialog({ open, onOpenChange, onCreated }: Props) {
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()
  const createMetaCampaign = useAction(adsCampaignsApi.createMetaCampaign) as (args: {
    workspaceId: string
    providerId: 'facebook'
    clientId?: string | null
    name: string
    objective: string
    status?: 'ACTIVE' | 'PAUSED'
    dailyBudget?: number
    startTime?: string
    stopTime?: string
  }) => Promise<{ success: boolean; campaignId?: string }>

  const [name, setName] = useState('')
  const [objective, setObjective] = useState<string>(META_OBJECTIVES[0].value)
  const [dailyBudget, setDailyBudget] = useState('')
  const [startTime, setStartTime] = useState('')
  const [stopTime, setStopTime] = useState('')
  const [loading, setLoading] = useState(false)

  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const handleSubmit = useCallback(async () => {
    if (!workspaceId || !name.trim()) return
    setLoading(true)
    try {
      await createMetaCampaign({
        workspaceId,
        providerId: 'facebook',
        clientId: selectedClientId,
        name: name.trim(),
        objective,
        status: 'PAUSED',
        dailyBudget: dailyBudget ? Number(dailyBudget) : undefined,
        startTime: startTime.trim() || undefined,
        stopTime: stopTime.trim() || undefined,
      })
      toast({ title: 'Campaign created', description: `"${name.trim()}" is paused in Meta — add ad sets next.` })
      setName('')
      setDailyBudget('')
      onOpenChange(false)
      onCreated?.()
    } catch (error) {
      reportConvexFailure({
        error,
        context: 'CreateMetaCampaignDialog',
        title: 'Could not create campaign',
        fallbackMessage: asErrorMessage(error),
      })
    } finally {
      setLoading(false)
    }
  }, [
    createMetaCampaign,
    dailyBudget,
    startTime,
    stopTime,
    name,
    objective,
    onCreated,
    onOpenChange,
    selectedClientId,
    workspaceId,
  ])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Meta campaign</DialogTitle>
          <DialogDescription>
            Creates a classic (non Advantage+) campaign in your connected ad account. Add ad sets on the campaign page.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <FormField id="meta-campaign-name" label="Campaign name">
            <Input
              id="meta-campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Spring promo"
            />
          </FormField>
          <FormField id="meta-campaign-objective" label="Objective">
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger id="meta-campaign-objective">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {META_OBJECTIVES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField id="meta-campaign-budget" label="Daily budget (optional)" description="Account currency">
            <Input
              id="meta-campaign-budget"
              type="number"
              min={1}
              value={dailyBudget}
              onChange={(e) => setDailyBudget(e.target.value)}
              placeholder="50"
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="meta-campaign-start" label="Start (optional)" description="ISO datetime">
              <Input
                id="meta-campaign-start"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </FormField>
            <FormField id="meta-campaign-stop" label="End (optional)" description="ISO datetime">
              <Input
                id="meta-campaign-stop"
                type="datetime-local"
                value={stopTime}
                onChange={(e) => setStopTime(e.target.value)}
              />
            </FormField>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={loading || !name.trim()}>
            {loading ? 'Creating…' : 'Create campaign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
