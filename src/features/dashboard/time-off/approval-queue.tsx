import type { TimeOffRequest } from '@/types/workforce'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'

export function ApprovalQueue({ requests }: { requests: TimeOffRequest[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Approval queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="rounded-2xl border border-muted/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{request.personName}</p>
                <p className="text-sm text-muted-foreground">{request.type} · {request.windowLabel}</p>
              </div>
              <WorkforceStatusBadge tone={request.status === 'approved' ? 'success' : request.status === 'pending' ? 'warning' : 'critical'}>
                {request.status}
              </WorkforceStatusBadge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Approver: {request.approver}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
