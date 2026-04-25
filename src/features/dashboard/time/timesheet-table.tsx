import type { TimeSession } from '@/types/workforce'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { LoaderCircle } from 'lucide-react'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'

function getTone(status: TimeSession['status']) {
  switch (status) {
    case 'clocked-in':
    case 'clocked-out':
      return 'success'
    case 'on-break':
      return 'warning'
    default:
      return 'critical'
  }
}

type TimesheetTableProps = {
  sessions: TimeSession[]
  canReview?: boolean
  pendingSessionId?: string | null
  onReview?: (sessionId: string, decision: 'approve' | 'reject' | 'flag') => void
}

export function TimesheetTable({
  sessions,
  canReview = false,
  pendingSessionId = null,
  onReview,
}: TimesheetTableProps) {
  const colSpan = canReview ? 6 : 5

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Timesheet review queue</CardTitle>
        <p className="text-sm text-muted-foreground">
          {canReview
            ? 'Use actions to approve, reject, or flag entries for the team record.'
            : 'Read-only queue; managers and admins can review sessions when signed in with team access.'}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Person</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              {canReview ? <TableHead className="w-[200px]">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-muted-foreground">
                  No sessions in the queue yet. Clock in or seed the time module to see entries here.
                </TableCell>
              </TableRow>
            ) : null}
            {sessions.map((session) => {
              const review = session.managerReview ?? 'none'
              return (
                <TableRow key={session.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{session.personName}</p>
                      <p className="text-xs text-muted-foreground">{session.role}</p>
                    </div>
                  </TableCell>
                  <TableCell>{session.project}</TableCell>
                  <TableCell>
                    {session.startedAt} - {session.endedAt ?? 'Live'} · {session.durationLabel}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <WorkforceStatusBadge tone={getTone(session.status)}>
                        {session.status.replace('-', ' ')}
                      </WorkforceStatusBadge>
                      {review !== 'none' ? (
                        <span className="text-xs text-muted-foreground">Review: {review}</span>
                      ) : null}
                      {session.approvedByName ? (
                        <span className="text-xs text-muted-foreground">By {session.approvedByName}</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{session.locationLabel}</p>
                      {session.flaggedReason ? (
                        <p className="text-xs text-destructive">{session.flaggedReason}</p>
                      ) : null}
                      {session.managerNote ? (
                        <p className="text-xs text-muted-foreground">Note: {session.managerNote}</p>
                      ) : null}
                    </div>
                  </TableCell>
                  {canReview && onReview ? (
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="default"
                          className="h-7 px-2 text-xs"
                          disabled={pendingSessionId === session.id}
                          onClick={() => onReview(session.id, 'approve')}
                        >
                          {pendingSessionId === session.id ? (
                            <LoaderCircle className="h-3 w-3 animate-spin" />
                          ) : (
                            'OK'
                          )}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          disabled={pendingSessionId === session.id}
                          onClick={() => onReview(session.id, 'reject')}
                        >
                          Reject
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="h-7 px-2 text-xs"
                          disabled={pendingSessionId === session.id}
                          onClick={() => onReview(session.id, 'flag')}
                        >
                          Flag
                        </Button>
                      </div>
                    </TableCell>
                  ) : null}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
