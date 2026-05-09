import { Clock3, LoaderCircle, MapPin, PauseCircle, PlayCircle } from 'lucide-react'

import type { TimeSession } from '@/types/workforce'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

interface TimeClockCardProps {
  activeSession: TimeSession | null
  pendingAction: 'clockIn' | 'startBreak' | 'clockOut' | null
  isClockInBlocked?: boolean
  clockInBlockedReason?: string
  onClockIn: () => void
  onStartBreak: () => void
  onClockOut: () => void
}

export function TimeClockCard({
  activeSession,
  pendingAction,
  isClockInBlocked = false,
  clockInBlockedReason,
  onClockIn,
  onStartBreak,
  onClockOut,
}: TimeClockCardProps) {
  const statusTone = activeSession?.status === 'clocked-in'
    ? 'success'
    : activeSession?.status === 'on-break'
      ? 'warning'
      : 'neutral'

  const statusLabel = activeSession?.status
    ? activeSession.status.replace('-', ' ')
    : 'Not clocked in'

  return (
    <Card className="border-accent/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span>Live clock state</span>
          <WorkforceStatusBadge tone={statusTone}>{statusLabel}</WorkforceStatusBadge>
        </CardTitle>
        <CardDescription>Run time actions against Convex while keeping preview mode available for demos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-accent/15 bg-accent/5 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-accent/10 p-3 text-primary">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{activeSession?.personName ?? 'Ready to start a session'}</p>
              <p className="text-sm text-muted-foreground">
                {activeSession
                  ? `${activeSession.status === 'on-break' ? 'Break started' : 'Clocked in'} at ${activeSession.startedAt} for ${activeSession.project}`
                  : 'No active session yet. Clock in to start tracking operational coverage.'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {activeSession?.locationLabel ?? 'Workspace default geofence will be attached to the next session'}
          </div>
          {activeSession?.geofenceStatus ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Location compliance:{' '}
              <span className={activeSession.geofenceStatus === 'inside' ? 'text-success' : activeSession.geofenceStatus === 'outside' ? 'text-destructive' : 'text-warning'}>
                {activeSession.geofenceStatus === 'inside'
                  ? 'Inside approved zone'
                  : activeSession.geofenceStatus === 'outside'
                    ? 'Outside approved zone'
                    : 'Manual override'}
              </span>
            </p>
          ) : null}
          {activeSession?.breakDueInMinutes ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Break reminder due in {activeSession.breakDueInMinutes} minutes.
            </p>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {activeSession ? (
            <>
              <Button
                className="justify-start gap-2 rounded-xl"
                onClick={onStartBreak}
                disabled={pendingAction !== null || activeSession.status === 'on-break'}
              >
                {pendingAction === 'startBreak' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PauseCircle className="h-4 w-4" />}
                {activeSession.status === 'on-break' ? 'Break active' : 'Start break'}
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2 rounded-xl"
                onClick={onClockOut}
                disabled={pendingAction !== null}
              >
                {pendingAction === 'clockOut' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
                Clock out
              </Button>
            </>
          ) : (
            <Button
              className="justify-start gap-2 rounded-xl sm:col-span-2"
              onClick={onClockIn}
              disabled={pendingAction !== null || isClockInBlocked}
            >
              {pendingAction === 'clockIn' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              Clock in
            </Button>
          )}
        </div>
        {isClockInBlocked && !activeSession ? (
          <p className="text-xs text-warning">{clockInBlockedReason ?? 'Clock-in is blocked by location/compliance policy.'}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
