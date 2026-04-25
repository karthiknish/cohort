'use client'

import { useCallback, useState } from 'react'

import { asErrorMessage, logError } from '@/lib/convex-errors'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { useToast } from '@/shared/ui/use-toast'
import { LoaderCircle } from 'lucide-react'

type TimeOffRequestDialogProps = {
  workspaceId: string | null
  isPreviewMode: boolean
  onSubmit: (args: { type: string; windowLabel: string }) => Promise<void>
}

export function TimeOffRequestDialog({ workspaceId, isPreviewMode, onSubmit }: TimeOffRequestDialogProps) {
  const { toast } = useToast()
  const [leaveType, setLeaveType] = useState('Annual leave')
  const [windowLabel, setWindowLabel] = useState('')
  const [pending, setPending] = useState(false)

  const handleStart = useCallback(async () => {
    if (isPreviewMode) {
      toast({ title: 'Preview mode', description: 'Time off requests are demonstration-only in preview.' })
      return
    }
    if (!workspaceId) {
      toast({ title: 'Workspace required', description: 'Sign in to submit a request.', variant: 'destructive' })
      return
    }
    if (!windowLabel.trim()) {
      toast({ title: 'Dates required', description: 'Enter when you need leave (e.g. May 5 - May 9).', variant: 'destructive' })
      return
    }
    setPending(true)
    try {
      await onSubmit({ type: leaveType.trim() || 'Leave', windowLabel: windowLabel.trim() })
      setWindowLabel('')
      toast({ title: 'Request submitted' })
    } catch (error) {
      logError(error, 'time-off:submit-request')
      toast({ title: 'Request failed', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setPending(false)
    }
  }, [isPreviewMode, onSubmit, toast, windowLabel, workspaceId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Request time off</CardTitle>
        <CardDescription>Submit a leave request to your team queue. Approvers can act from the list beside this form.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-2">
          <Label htmlFor="to-type">Leave type</Label>
          <Input
            id="to-type"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            className="rounded-xl"
            placeholder="Annual leave, sick, flex day…"
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to-window">When</Label>
          <Input
            id="to-window"
            value={windowLabel}
            onChange={(e) => setWindowLabel(e.target.value)}
            className="rounded-xl"
            placeholder="e.g. May 5 - May 9 or Apr 12"
            disabled={pending}
          />
        </div>
        <Button
          type="button"
          variant="default"
          className="rounded-xl"
          onClick={() => void handleStart()}
          disabled={pending}
        >
          {pending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit request
        </Button>
      </CardContent>
    </Card>
  )
}
