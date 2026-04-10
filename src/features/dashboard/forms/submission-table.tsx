import type { ChecklistSubmission } from '@/types/workforce'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'

export function SubmissionTable({ submissions }: { submissions: ChecklistSubmission[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent submissions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template</TableHead>
              <TableHead>Submitted by</TableHead>
              <TableHead>When</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                  No submissions yet. Complete a checklist or seed the forms module to populate this table.
                </TableCell>
              </TableRow>
            ) : null}
            {submissions.map((submission) => (
              <TableRow key={submission.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-foreground">{submission.templateTitle}</p>
                    <p className="text-xs text-muted-foreground">{submission.scoreLabel}</p>
                  </div>
                </TableCell>
                <TableCell>{submission.submittedBy}</TableCell>
                <TableCell>{submission.submittedAt}</TableCell>
                <TableCell>
                  <WorkforceStatusBadge tone={submission.status === 'ready' ? 'success' : submission.status === 'in-review' ? 'warning' : 'critical'}>
                    {submission.status.replace('-', ' ')}
                  </WorkforceStatusBadge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
