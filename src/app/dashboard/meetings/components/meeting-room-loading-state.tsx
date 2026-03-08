'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type MeetingRoomLoadingStateProps = {
  sharedRoomName: string
  onBack: () => void
}

export function MeetingRoomLoadingState(props: MeetingRoomLoadingStateProps) {
  const { sharedRoomName, onBack } = props

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[28px] border border-border bg-card px-5 py-4 shadow-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.32em] text-muted-foreground">Meetings</p>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Meeting room</h1>
            <p className="text-sm text-muted-foreground">Resolving room workspace for {sharedRoomName}.</p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={onBack}>
          Back to meetings
        </Button>
      </div>

      <Alert>
        <AlertTitle>Loading room</AlertTitle>
        <AlertDescription>Preparing the in-site meeting workspace.</AlertDescription>
      </Alert>
    </>
  )
}