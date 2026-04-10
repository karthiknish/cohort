'use client'

import { CalendarDays, CheckCircle2, Plane, ShieldCheck } from 'lucide-react'

import {
  getPreviewTimeOffBalances,
  getPreviewTimeOffRequests,
} from '@/lib/preview-data'
import { WORKFORCE_ROUTE_MAP } from '@/lib/workforce-routes'
import { WorkforcePageShell } from '@/features/dashboard/workforce/workforce-page-shell'

import { ApprovalQueue } from './approval-queue'
import { TimeOffBalanceCard } from './time-off-balance-card'
import { TimeOffRequestDialog } from './time-off-request-dialog'

export default function TimeOffPage() {
  const route = WORKFORCE_ROUTE_MAP['time-off']
  const balances = getPreviewTimeOffBalances()
  const requests = getPreviewTimeOffRequests()

  return (
    <WorkforcePageShell
      routeId={route.id}
      title={route.title}
      description={route.description}
      icon={route.icon}
      badgeLabel="P2 module"
      stats={[
        { label: 'Balances tracked', value: String(balances.length), description: 'Leave buckets visible in the preview model', icon: CalendarDays },
        { label: 'Pending approvals', value: '1', description: 'Requests waiting for action', icon: ShieldCheck, variant: 'warning' },
        { label: 'Approved recently', value: '1', description: 'Recent approvals already visible in the queue', icon: CheckCircle2, variant: 'success' },
        { label: 'Travel overlap checks', value: 'Enabled', description: 'Ready for on-site review week constraints', icon: Plane },
      ]}
      ctaHref="/dashboard/scheduling"
      ctaLabel="Reflect approved leave in schedules"
    >
      <div className="grid gap-4 md:grid-cols-3">
        {balances.map((balance) => (
          <TimeOffBalanceCard key={balance.id} balance={balance} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <ApprovalQueue requests={requests} />
        <TimeOffRequestDialog />
      </div>
    </WorkforcePageShell>
  )
}
