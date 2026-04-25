import { type MouseEvent, useCallback, useMemo } from 'react'
import type { Shift } from '@/types/workforce'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'

function getTone(status: Shift['status']) {
  switch (status) {
    case 'scheduled':
      return 'success'
    case 'open':
      return 'warning'
    default:
      return 'critical'
  }
}

function getCoveragePct(shift: Shift) {
  if (!shift.requiredStaff || shift.requiredStaff <= 0) return 100
  const filled = shift.filledStaff ?? 0
  return Math.min(100, Math.max(0, Math.round((filled / shift.requiredStaff) * 100)))
}

function getCoverageWidthClass(pct: number) {
  if (pct >= 100) return 'w-full'
  if (pct >= 90) return 'w-[90%]'
  if (pct >= 80) return 'w-[80%]'
  if (pct >= 70) return 'w-[70%]'
  if (pct >= 60) return 'w-[60%]'
  if (pct >= 50) return 'w-1/2'
  if (pct >= 40) return 'w-[40%]'
  if (pct >= 30) return 'w-[30%]'
  if (pct >= 20) return 'w-1/5'
  if (pct >= 10) return 'w-[10%]'
  return 'w-[4%]'
}

export function ScheduleBoard({
  shifts,
  onClaimShift,
  onRequestSwap,
  claimingShiftId,
}: {
  shifts: Shift[]
  onClaimShift?: (shiftId: string) => void
  onRequestSwap?: (shiftId: string) => void
  claimingShiftId?: string | null
}) {
  const openShiftCount = useMemo(() => shifts.filter((shift) => shift.status === 'open').length, [shifts])
  const handleClaimClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const shiftId = event.currentTarget.dataset.shiftId
      if (shiftId && onClaimShift) {
        onClaimShift(shiftId)
      }
    },
    [onClaimShift],
  )
  const handleSwapClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const shiftId = event.currentTarget.dataset.shiftId
      if (shiftId && onRequestSwap) {
        onRequestSwap(shiftId)
      }
    },
    [onRequestSwap],
  )

  if (shifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly coverage board</CardTitle>
          <CardDescription>
            Purpose-built for operational visibility instead of project-only planning.
          </CardDescription>
        </CardHeader>
        <CardContent className="rounded-lg border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
          <p className="text-sm font-medium text-foreground">No shifts this week</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add coverage blocks or seed scheduling data to see the board fill in.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Weekly coverage board</CardTitle>
        <CardDescription>
          Purpose-built for operational visibility instead of project-only planning. {openShiftCount} open shift{openShiftCount === 1 ? '' : 's'} can be claimed.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {shifts.map((shift) => {
          const coveragePct = getCoveragePct(shift)
          return (
          <div key={shift.id} className="rounded-2xl border border-muted/50 bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{shift.title}</p>
                <p className="text-sm text-muted-foreground">{shift.dayLabel} · {shift.timeLabel}</p>
              </div>
              <WorkforceStatusBadge tone={getTone(shift.status)}>{shift.status.replace('-', ' ')}</WorkforceStatusBadge>
            </div>
            <div className="mt-4 space-y-1 text-sm">
              <p><span className="text-muted-foreground">Owner:</span> {shift.assignee}</p>
              <p><span className="text-muted-foreground">Team:</span> {shift.team}</p>
              <p><span className="text-muted-foreground">Coverage:</span> {shift.coverageLabel}</p>
              {shift.locationLabel ? (
                <p>
                  <span className="text-muted-foreground">Location:</span> {shift.locationLabel}
                </p>
              ) : null}
              {shift.conflictWithTimeOff ? (
                <p className="text-xs text-amber-700 dark:text-amber-400">Time off: {shift.conflictWithTimeOff}</p>
              ) : null}
              {shift.conflictWithAvailability ? (
                <p className="text-xs text-amber-700 dark:text-amber-400">Availability: {shift.conflictWithAvailability}</p>
              ) : null}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Staffed</span>
                <span>{shift.filledStaff ?? 0}/{shift.requiredStaff ?? 0}</span>
              </div>
              <div className="h-2 rounded-full bg-muted">
                <div className={`h-2 rounded-full bg-primary ${getCoverageWidthClass(coveragePct)}`} />
              </div>
            </div>
            {shift.status === 'open' && shift.canClaim && onClaimShift ? (
              <div className="mt-4">
                <Button
                  size="sm"
                  data-shift-id={shift.id}
                  onClick={handleClaimClick}
                  disabled={Boolean(claimingShiftId)}
                >
                  {claimingShiftId === shift.id ? 'Claiming...' : 'Claim shift'}
                </Button>
              </div>
            ) : null}
            {shift.status !== 'open' && onRequestSwap ? (
              <div className="mt-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  data-shift-id={shift.id}
                  onClick={handleSwapClick}
                >
                  Request handoff
                </Button>
              </div>
            ) : null}
          </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
