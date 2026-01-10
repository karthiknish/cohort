'use client'

import Link from 'next/link'
import React, { useMemo } from 'react'
import { AlertTriangle, ArrowRight, CheckCircle2, FileText, PlugZap, TriangleAlert } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { TaskSummary } from '@/app/dashboard/components/utils'
import type { FinanceSummaryResponse } from '@/types/finance'
import type { ProposalDraft } from '@/services/proposals'
import type { IntegrationStatusSummary } from '@/app/dashboard/hooks/use-integration-status-summary'

type Props = {
  taskSummary: TaskSummary
  financeSummary: FinanceSummaryResponse | null
  proposals: ProposalDraft[]
  integrationSummary?: IntegrationStatusSummary
  loading?: {
    finance?: boolean
    proposals?: boolean
    integrations?: boolean
  }
}

function countUpcomingProposals(proposals: ProposalDraft[]) {
  const inProgress = proposals.filter((p) => p.status === 'in_progress').length
  const ready = proposals.filter((p) => p.status === 'ready').length
  const sent = proposals.filter((p) => p.status === 'sent').length
  return { inProgress, ready, sent, total: inProgress + ready + sent }
}

export function AttentionSummaryCard({ taskSummary, financeSummary, proposals, integrationSummary, loading }: Props) {
  const overdueInvoices = financeSummary?.payments?.overdueCount ?? 0
  const openInvoices = financeSummary?.payments?.openCount ?? 0

  const proposalCounts = useMemo(() => countUpcomingProposals(proposals), [proposals])

  const urgentTasks = taskSummary.overdue + taskSummary.dueSoon + taskSummary.highPriority

  const hasAttention =
    urgentTasks > 0 || overdueInvoices > 0 || proposalCounts.total > 0 || (integrationSummary?.failedCount ?? 0) > 0

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-primary" />
              What needs attention today
            </CardTitle>
            <CardDescription>Across tasks, billing, proposals, and integrations.</CardDescription>
          </div>
          {hasAttention ? (
            <Badge variant="destructive" className="text-[10px] uppercase font-bold tracking-wide">
              Action needed
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wide">
              All clear
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tasks */}
        <div className="rounded-xl border bg-card p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tasks</p>
            {urgentTasks > 0 ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            )}
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-xl font-semibold tabular-nums">{urgentTasks}</p>
            <p className="text-xs text-muted-foreground">
              {taskSummary.overdue} overdue · {taskSummary.dueSoon} due soon · {taskSummary.highPriority} high priority
            </p>
          </div>
          <div className="mt-3">
            <Link href="/dashboard/tasks">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
                View tasks <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Invoices */}
        <div className="rounded-xl border bg-card p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Invoices</p>
            {overdueInvoices > 0 ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            )}
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-xl font-semibold tabular-nums">
              {loading?.finance ? '—' : overdueInvoices}
            </p>
            <p className="text-xs text-muted-foreground">{openInvoices} open · {overdueInvoices} overdue</p>
          </div>
          <div className="mt-3">
            <Link href="/dashboard/finance/payments">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
                View billing <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Proposals */}
        <div className="rounded-xl border bg-card p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Proposals</p>
            <FileText className={cn('h-4 w-4', proposalCounts.total > 0 ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-xl font-semibold tabular-nums">{loading?.proposals ? '—' : proposalCounts.total}</p>
            <p className="text-xs text-muted-foreground">
              {proposalCounts.inProgress} in progress · {proposalCounts.ready} ready · {proposalCounts.sent} sent
            </p>
          </div>
          <div className="mt-3">
            <Link href="/dashboard/proposals">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
                View proposals <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Integrations */}
        <div className="rounded-xl border bg-card p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Integrations</p>
            <PlugZap className={cn('h-4 w-4', (integrationSummary?.failedCount ?? 0) > 0 ? 'text-destructive' : 'text-muted-foreground')} />
          </div>
          <div className="mt-2 space-y-1">
            <p className="text-xl font-semibold tabular-nums">
              {loading?.integrations ? '—' : (integrationSummary?.failedCount ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">
              {integrationSummary ? `${integrationSummary.pendingCount} pending · ${integrationSummary.neverCount} never` : 'Select workspaces to view'}
            </p>
          </div>
          <div className="mt-3">
            <Link href="/dashboard/ads">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
                View connections <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
