import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'

import type { CoverageAlert } from '@/types/workforce'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'

export function ClockHistoryPanel({ alerts }: { alerts: CoverageAlert[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Review history and exceptions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <p className="rounded-lg border border-dashed border-muted/60 bg-muted/10 px-4 py-8 text-center text-sm text-muted-foreground">
            No review items or exceptions logged. Alerts from scheduling and approvals will surface here.
          </p>
        ) : null}
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-2xl border border-muted/50 bg-muted/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {alert.severity === 'critical' ? (
                  <ShieldAlert className="mt-0.5 h-4 w-4 text-destructive" />
                ) : alert.severity === 'warning' ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-success" />
                )}
                <div>
                  <p className="font-medium text-foreground">{alert.title}</p>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                </div>
              </div>
              <WorkforceStatusBadge
                tone={alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'warning' : 'success'}
              >
                {alert.severity}
              </WorkforceStatusBadge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
