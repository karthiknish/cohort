import type { ShiftSwapRequest } from '@/types/workforce'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'

export function ShiftSwapPanel({ swaps }: { swaps: ShiftSwapRequest[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Swap requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {swaps.length === 0 ? (
          <p className="rounded-lg border border-dashed border-muted/60 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
            No swap requests yet. When someone needs coverage, requests will show up here for approval.
          </p>
        ) : null}
        {swaps.map((swap) => (
          <div key={swap.id} className="rounded-2xl border border-muted/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{swap.shiftTitle}</p>
                <p className="text-sm text-muted-foreground">{swap.windowLabel}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {swap.requestedBy} requested coverage from {swap.requestedTo}
                </p>
              </div>
              <WorkforceStatusBadge tone={swap.status === 'approved' ? 'success' : swap.status === 'pending' ? 'warning' : 'critical'}>
                {swap.status}
              </WorkforceStatusBadge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
