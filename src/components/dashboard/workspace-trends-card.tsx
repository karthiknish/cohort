'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { ArrowUpRight, DollarSign, Trophy, TriangleAlert } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import type { ClientComparisonSummary } from '@/types/dashboard'
import { formatCurrency } from '@/lib/utils'
import { formatRoas } from '@/lib/dashboard-utils'

type Props = {
  summaries: ClientComparisonSummary[]
  periodDays: number
  mixedCurrencies: boolean
}

export function WorkspaceTrendsCard({ summaries, periodDays, mixedCurrencies }: Props) {
  const insights = useMemo(() => {
    if (summaries.length === 0) return null

    const byRevenue = [...summaries].sort((a, b) => b.totalRevenue - a.totalRevenue)
    const bySpend = [...summaries].sort((a, b) => b.totalAdSpend - a.totalAdSpend)
    const byOutstanding = [...summaries].sort((a, b) => b.outstanding - a.outstanding)

    const roasCandidates = summaries.filter((s) => Number.isFinite(s.roas) && s.roas !== 0)
    const roasLeader = [...roasCandidates].sort((a, b) => (b.roas === Number.POSITIVE_INFINITY ? Number.MAX_VALUE : b.roas) - (a.roas === Number.POSITIVE_INFINITY ? Number.MAX_VALUE : a.roas))[0]

    return {
      revenueLeader: byRevenue[0],
      spendLeader: bySpend[0],
      outstandingLeader: byOutstanding[0],
      roasLeader,
    }
  }, [summaries])

  if (!insights) return null

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Trending across workspaces
            </CardTitle>
            <CardDescription>Leaders across your selected workspaces (last {periodDays} days).</CardDescription>
          </div>
          {mixedCurrencies && (
            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wide">
              Mixed currencies
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {insights.roasLeader && (
          <div className="rounded-xl border bg-card p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" /> ROAS leader
            </p>
            <p className="mt-1 text-sm font-semibold">{insights.roasLeader.clientName}</p>
            <p className="text-xs text-muted-foreground">{formatRoas(insights.roasLeader.roas)} ROAS</p>
          </div>
        )}

        {insights.revenueLeader && (
          <div className="rounded-xl border bg-card p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Revenue leader</p>
            <p className="mt-1 text-sm font-semibold">{insights.revenueLeader.clientName}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(insights.revenueLeader.totalRevenue, insights.revenueLeader.currency)}</p>
          </div>
        )}

        {insights.spendLeader && (
          <div className="rounded-xl border bg-card p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Highest ad spend</p>
            <p className="mt-1 text-sm font-semibold">{insights.spendLeader.clientName}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(insights.spendLeader.totalAdSpend, insights.spendLeader.currency)}</p>
          </div>
        )}

        {insights.outstandingLeader && (
          <div className="rounded-xl border bg-card p-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <TriangleAlert className="h-4 w-4 text-destructive" /> Most outstanding
            </p>
            <p className="mt-1 text-sm font-semibold">{insights.outstandingLeader.clientName}</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(insights.outstandingLeader.outstanding, insights.outstandingLeader.currency)}</p>
          </div>
        )}

        <div className="sm:col-span-2 flex justify-end">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1">
              View comparison <ArrowUpRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
