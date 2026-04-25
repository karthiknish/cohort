import type { ShiftSwapRequest } from '@/types/workforce'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { LoaderCircle } from 'lucide-react'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'

type ShiftSwapPanelProps = {
  swaps: ShiftSwapRequest[]
  canReview?: boolean
  pendingSwapId?: string | null
  onApprove?: (swapId: string) => void
  onBlock?: (swapId: string) => void
}

export function ShiftSwapPanel({
  swaps,
  canReview = false,
  pendingSwapId = null,
  onApprove,
  onBlock,
}: ShiftSwapPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Swap requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {swaps.length === 0 ? (
          <p className="rounded-lg border border-dashed border-muted/60 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
            No swap requests yet. Use Request handoff on a shift, or wait for a teammate to propose one.
          </p>
        ) : null}
        {swaps.map((swap) => (
          <div key={swap.id} className="rounded-2xl border border-muted/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{swap.shiftTitle}</p>
                <p className="text-sm text-muted-foreground">{swap.windowLabel}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {swap.requestedBy} → {swap.requestedTo}
                </p>
              </div>
              <WorkforceStatusBadge tone={swap.status === 'approved' ? 'success' : swap.status === 'pending' ? 'warning' : 'critical'}>
                {swap.status}
              </WorkforceStatusBadge>
            </div>
            {canReview && swap.status === 'pending' && onApprove && onBlock ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="default"
                  disabled={pendingSwapId === swap.id}
                  onClick={() => onApprove(swap.id)}
                >
                  {pendingSwapId === swap.id ? <LoaderCircle className="h-3 w-3 animate-spin" /> : 'Approve'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={pendingSwapId === swap.id}
                  onClick={() => onBlock(swap.id)}
                >
                  Dismiss
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
