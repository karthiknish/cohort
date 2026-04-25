import type { TimeOffRequest } from '@/types/workforce'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { LoaderCircle } from 'lucide-react'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'

type ApprovalQueueProps = {
  requests: TimeOffRequest[]
  canReview?: boolean
  pendingActionId?: string | null
  onApprove?: (id: string) => void
  onDecline?: (id: string) => void
}

export function ApprovalQueue({
  requests,
  canReview = false,
  pendingActionId = null,
  onApprove,
  onDecline,
}: ApprovalQueueProps) {
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
                <p className="text-sm text-muted-foreground">
                  {request.type} · {request.windowLabel}
                </p>
              </div>
              <WorkforceStatusBadge
                tone={request.status === 'approved' ? 'success' : request.status === 'pending' ? 'warning' : 'critical'}
              >
                {request.status}
              </WorkforceStatusBadge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Approver: {request.approver}</p>
            {canReview && request.status === 'pending' && onApprove && onDecline ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDecline(request.id)}
                  disabled={pendingActionId === request.id}
                >
                  {pendingActionId === request.id ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Decline
                </Button>
                <Button
                  size="sm"
                  onClick={() => onApprove(request.id)}
                  disabled={pendingActionId === request.id}
                >
                  {pendingActionId === request.id ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Approve
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
