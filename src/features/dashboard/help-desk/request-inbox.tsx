import type { HelpDeskRequest } from '@/types/workforce'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'

export function RequestInbox({ requests }: { requests: HelpDeskRequest[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Request inbox</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="rounded-2xl border border-muted/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{request.title}</p>
                <p className="text-sm text-muted-foreground">{request.queue} · {request.requester}</p>
              </div>
              <WorkforceStatusBadge tone={request.status === 'resolved' ? 'success' : request.status === 'pending' ? 'warning' : 'critical'}>
                {request.status}
              </WorkforceStatusBadge>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>Priority: {request.priority}</span>
              <span>{request.slaLabel}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
