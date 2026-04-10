import type { CoverageAlert } from '@/types/workforce'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'

export function CoverageWarningBanner({ alerts }: { alerts: CoverageAlert[] }) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted/60 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
        No coverage alerts right now. Scheduling looks clear for the current planning window.
      </div>
    )
  }

  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="rounded-2xl border border-muted/50 bg-muted/20 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-foreground">{alert.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
            </div>
            <WorkforceStatusBadge
              tone={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'success'}
            >
              {alert.severity}
            </WorkforceStatusBadge>
          </div>
        </div>
      ))}
    </div>
  )
}
