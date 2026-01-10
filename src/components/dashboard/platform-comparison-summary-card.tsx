'use client'

import Link from 'next/link'
import React, { useMemo } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import type { MetricRecord } from '@/types/dashboard'
import { PROVIDER_LABELS } from '@/app/dashboard/analytics/hooks/types'

type ProviderSummary = {
  providerId: string
  label: string
  spend: number
  revenue: number
  clicks: number
  conversions: number
  roas: number
}

type Props = {
  metrics: MetricRecord[]
  isLoading: boolean
}

export function PlatformComparisonSummaryCard({ metrics, isLoading }: Props) {
  const summaries = useMemo(() => {
    const byProvider: Record<string, ProviderSummary> = {}

    for (const m of metrics) {
      const key = m.providerId
      if (!byProvider[key]) {
        byProvider[key] = {
          providerId: key,
          label: PROVIDER_LABELS[key] ?? key,
          spend: 0,
          revenue: 0,
          clicks: 0,
          conversions: 0,
          roas: 0,
        }
      }

      byProvider[key].spend += m.spend
      byProvider[key].revenue += m.revenue ?? 0
      byProvider[key].clicks += m.clicks
      byProvider[key].conversions += m.conversions
    }

    const list = Object.values(byProvider)
      .map((s) => ({ ...s, roas: s.spend > 0 ? s.revenue / s.spend : 0 }))
      .sort((a, b) => b.spend - a.spend)

    return list
  }, [metrics])

  const totalSpend = useMemo(() => summaries.reduce((acc, s) => acc + s.spend, 0), [summaries])

  // Render whenever we have data (or we're loading). This makes it useful for clients too,
  // even if they only have one connected platform.
  if (!isLoading && summaries.length === 0) return null

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Platform comparison</CardTitle>
            <CardDescription>Click a platform to open Analytics filtered to it.</CardDescription>
          </div>
          {summaries.length > 0 && (
            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wide">
              {summaries.length} platforms
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <div className="grid grid-cols-12 gap-2 border-b bg-muted/30 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-5">Platform</div>
              <div className="col-span-3 text-right">Spend</div>
              <div className="col-span-3 text-right">Revenue</div>
              <div className="col-span-1 text-right">ROAS</div>
            </div>
            {summaries.slice(0, 5).map((s) => {
              const share = totalSpend > 0 ? (s.spend / totalSpend) * 100 : 0
              const href = `/dashboard/analytics?platform=${encodeURIComponent(s.providerId)}`

              return (
                <Link
                  key={s.providerId}
                  href={href}
                  className="block focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 text-sm transition-colors hover:bg-muted/20">
                    <div className="col-span-5 flex items-center justify-between gap-2">
                      <span className="font-medium">{s.label}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">{share.toFixed(0)}%</span>
                    </div>
                    <div className="col-span-3 text-right tabular-nums">{formatCurrency(s.spend)}</div>
                    <div className="col-span-3 text-right tabular-nums">{formatCurrency(s.revenue)}</div>
                    <div className="col-span-1 text-right tabular-nums">{s.roas.toFixed(2)}x</div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {!isLoading && summaries.length < 2 && (
          <p className="mt-3 text-xs text-muted-foreground">Connect multiple platforms to see a comparison.</p>
        )}
      </CardContent>
    </Card>
  )
}
