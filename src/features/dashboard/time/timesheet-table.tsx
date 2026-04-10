import type { TimeSession } from '@/types/workforce'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
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

export function TimesheetTable({ sessions }: { sessions: TimeSession[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Timesheet review queue</CardTitle>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                  No sessions in the queue yet. Clock in or seed the time module to see entries here.
                </TableCell>
              </TableRow>
            ) : null}
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{session.personName}</p>
                    <p className="text-xs text-muted-foreground">{session.role}</p>
                  </div>
                </TableCell>
                <TableCell>{session.project}</TableCell>
                <TableCell>{session.startedAt} - {session.endedAt ?? 'Live'} · {session.durationLabel}</TableCell>
                <TableCell>
                  <WorkforceStatusBadge tone={getTone(session.status)}>
                    {session.status.replace('-', ' ')}
                  </WorkforceStatusBadge>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{session.locationLabel}</p>
                    {session.flaggedReason ? (
                      <p className="text-xs text-destructive">{session.flaggedReason}</p>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
