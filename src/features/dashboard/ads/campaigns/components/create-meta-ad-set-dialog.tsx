'use client'

import { useAction } from 'convex/react'
import { useCallback, useState, type ChangeEvent } from 'react'

import { adsAdSetsApi } from '@/lib/convex-api'
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
import { toast } from '@/shared/ui/use-toast'
import { resolveMetaAdSetDefaults } from '@/lib/meta-ad-set-defaults'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  campaignObjective?: string | null
  onCreated?: () => void
}

export function CreateMetaAdSetDialog({ open, onOpenChange, campaignId, campaignObjective, onCreated }: Props) {
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()
  const createAdSet = useAction(adsAdSetsApi.createAdSet)

  const [name, setName] = useState('')
  const [dailyBudget, setDailyBudget] = useState('')
  const [loading, setLoading] = useState(false)

  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const handleSubmit = useCallback(async () => {
    if (!workspaceId || !name.trim()) return
    setLoading(true)
    try {
      const { optimizationGoal, billingEvent } = resolveMetaAdSetDefaults(campaignObjective)
      await createAdSet({
        workspaceId,
        providerId: 'facebook',
        clientId: selectedClientId,
        campaignId,
        name: name.trim(),
        status: 'PAUSED',
        dailyBudget: dailyBudget ? Number(dailyBudget) : undefined,
        optimizationGoal,
        billingEvent,
      })
      toast({ title: 'Ad set created', description: `"${name.trim()}" is ready for ads.` })
      setName('')
      setDailyBudget('')
      onOpenChange(false)
      onCreated?.()
    } catch (error) {
      reportConvexFailure({
        error,
        context: 'CreateMetaAdSetDialog',
        title: 'Could not create ad set',
        fallbackMessage: asErrorMessage(error),
      })
    } finally {
      setLoading(false)
    }
  }, [campaignId, campaignObjective, createAdSet, dailyBudget, name, onCreated, onOpenChange, selectedClientId, workspaceId])

  const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }, [])

  const handleDailyBudgetChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDailyBudget(event.target.value)
  }, [])

  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleSubmitClick = useCallback(() => {
    void handleSubmit()
  }, [handleSubmit])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create ad set</DialogTitle>
          <DialogDescription>
            Adds a paused ad set to this campaign. Refine targeting on the Audience tab after creation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <FormField id="meta-adset-name" label="Ad set name">
            <Input
              id="meta-adset-name"
              value={name}
              onChange={handleNameChange}
              placeholder="US — Broad"
            />
          </FormField>
          <FormField id="meta-adset-budget" label="Daily budget (optional)">
            <Input
              id="meta-adset-budget"
              type="number"
              min={1}
              value={dailyBudget}
              onChange={handleDailyBudgetChange}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmitClick} disabled={loading || !name.trim()}>
            {loading ? 'Creating…' : 'Create ad set'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
