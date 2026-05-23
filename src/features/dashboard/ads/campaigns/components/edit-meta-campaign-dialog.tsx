'use client'

import { useAction } from 'convex/react'
import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { Pencil } from 'lucide-react'

import { adsMetaCampaignsApi } from '@/lib/convex-api'
import { asErrorMessage } from '@/lib/convex-errors'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { metaDatetimeLocalToIso, metaIsoToDatetimeLocal } from '@/lib/meta-datetime'
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
  DialogTrigger,
} from '@/shared/ui/dialog'
import { FormField } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'
import { toast } from '@/shared/ui/use-toast'

type Props = {
  campaignId: string
  initialName: string
  initialStartTime?: string
  initialStopTime?: string
  onUpdated?: () => void
}

export function EditMetaCampaignDialog({
  campaignId,
  initialName,
  initialStartTime,
  initialStopTime,
  onUpdated,
}: Props) {
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()
  const updateCampaign = useAction(adsMetaCampaignsApi.updateMetaCampaign)

  const [open, setOpen] = useState(false)
  const [name, setName] = useState(initialName)
  const [startTime, setStartTime] = useState('')
  const [stopTime, setStopTime] = useState('')
  const [loading, setLoading] = useState(false)

  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  useEffect(() => {
    if (!open) return
    setName(initialName)
    setStartTime(metaIsoToDatetimeLocal(initialStartTime))
    setStopTime(metaIsoToDatetimeLocal(initialStopTime))
  }, [initialName, initialStartTime, initialStopTime, open])

  const handleSubmit = useCallback(async () => {
    if (!workspaceId || !name.trim()) return
    setLoading(true)
    try {
      await updateCampaign({
        workspaceId,
        providerId: 'facebook',
        clientId: selectedClientId,
        campaignId,
        name: name.trim(),
        startTime: metaDatetimeLocalToIso(startTime),
        stopTime: metaDatetimeLocalToIso(stopTime),
      })
      toast({ title: 'Campaign updated', description: 'Changes are live in Meta.' })
      setOpen(false)
      onUpdated?.()
    } catch (error) {
      reportConvexFailure({
        error,
        context: 'EditMetaCampaignDialog',
        title: 'Could not update campaign',
        fallbackMessage: asErrorMessage(error),
      })
    } finally {
      setLoading(false)
    }
  }, [
    campaignId,
    name,
    onUpdated,
    selectedClientId,
    startTime,
    stopTime,
    updateCampaign,
    workspaceId,
  ])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil className="size-3.5" aria-hidden />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit campaign</DialogTitle>
          <DialogDescription>Update name and schedule in Meta.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <FormField id="campaign-edit-name" label="Campaign name">
            <Input id="campaign-edit-name" value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} />
          </FormField>
          <FormField id="campaign-edit-start" label="Start (optional)">
            <Input id="campaign-edit-start" type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </FormField>
          <FormField id="campaign-edit-stop" label="End (optional)">
            <Input id="campaign-edit-stop" type="datetime-local" value={stopTime} onChange={(e) => setStopTime(e.target.value)} />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={loading || !name.trim()}>
            {loading ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
