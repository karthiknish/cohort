'use client'

import { useAction } from 'convex/react'
import { useCallback, useState, type ChangeEvent } from 'react'
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

type EditMetaCampaignFormBodyProps = {
  campaignId: string
  initialName: string
  initialStartTime?: string
  initialStopTime?: string
  workspaceId: string | null
  selectedClientId: string | null
  onClose: () => void
  onUpdated?: () => void
}

function EditMetaCampaignFormBody({
  campaignId,
  initialName,
  initialStartTime,
  initialStopTime,
  workspaceId,
  selectedClientId,
  onClose,
  onUpdated,
}: EditMetaCampaignFormBodyProps) {
  const updateCampaign = useAction(adsMetaCampaignsApi.updateMetaCampaign)
  const [name, setName] = useState(initialName)
  const [startTime, setStartTime] = useState(() => metaIsoToDatetimeLocal(initialStartTime))
  const [stopTime, setStopTime] = useState(() => metaIsoToDatetimeLocal(initialStopTime))
  const [loading, setLoading] = useState(false)

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
      onClose()
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
    onClose,
    onUpdated,
    selectedClientId,
    startTime,
    stopTime,
    updateCampaign,
    workspaceId,
  ])

  const handleNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value)
  }, [])

  const handleStartTimeChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setStartTime(event.target.value)
  }, [])

  const handleStopTimeChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setStopTime(event.target.value)
  }, [])

  const handleSubmitClick = useCallback(() => {
    void handleSubmit()
  }, [handleSubmit])

  return (
    <>
      <div className="space-y-4 py-2">
        <FormField id="campaign-edit-name" label="Campaign name">
          <Input id="campaign-edit-name" value={name} onChange={handleNameChange} />
        </FormField>
        <FormField id="campaign-edit-start" label="Start (optional)">
          <Input
            id="campaign-edit-start"
            type="datetime-local"
            value={startTime}
            onChange={handleStartTimeChange}
          />
        </FormField>
        <FormField id="campaign-edit-stop" label="End (optional)">
          <Input
            id="campaign-edit-stop"
            type="datetime-local"
            value={stopTime}
            onChange={handleStopTimeChange}
          />
        </FormField>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmitClick} disabled={loading || !name.trim()}>
          {loading ? 'Saving…' : 'Save'}
        </Button>
      </DialogFooter>
    </>
  )
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
  const [open, setOpen] = useState(false)

  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const formResetKey = `${campaignId}-${initialName}-${initialStartTime ?? ''}-${initialStopTime ?? ''}`

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

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
        {open ? (
          <EditMetaCampaignFormBody
            key={formResetKey}
            campaignId={campaignId}
            initialName={initialName}
            initialStartTime={initialStartTime}
            initialStopTime={initialStopTime}
            workspaceId={workspaceId}
            selectedClientId={selectedClientId}
            onClose={handleClose}
            onUpdated={onUpdated}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
