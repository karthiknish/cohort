'use client'

import { useMemo } from 'react'
import { Monitor, Radio, Share2 } from 'lucide-react'

import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import type { AnalyticsBreakdownRow } from '../hooks/use-analytics-data'

type BreakdownDimension = AnalyticsBreakdownRow['dimension']

const DIMENSION_META: Record<
  BreakdownDimension,
  { title: string; description: string; icon: typeof Share2 }
> = {
  channel: {
    title: 'Channel',
    description: 'Default channel grouping for sessions in range.',
    icon: Radio,
  },
  source: {
    title: 'Source',
    description: 'Session source for traffic in range.',
    icon: Share2,
  },
  device: {
    title: 'Device',
    description: 'Device category mix for sessions in range.',
    icon: Monitor,
  },
}

function aggregateBreakdown(rows: AnalyticsBreakdownRow[], dimension: BreakdownDimension) {
  const totals = new Map<string, { label: string; sessions: number; users: number; conversions: number }>()

  for (const row of rows) {
    if (row.dimension !== dimension) continue
    const key = row.dimensionValue
    const existing = totals.get(key) ?? { label: key, sessions: 0, users: 0, conversions: 0 }
    existing.sessions += row.sessions
    existing.users += row.users
    existing.conversions += row.conversions
    totals.set(key, existing)
  }

  const totalSessions = Array.from(totals.values()).reduce((sum, entry) => sum + entry.sessions, 0)

  return Array.from(totals.values())
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 6)
    .map((entry) => ({
      ...entry,
      share: totalSessions > 0 ? (entry.sessions / totalSessions) * 100 : 0,
    }))
}

function BreakdownShareBar({ share }: { share: number }) {
  const widthStyle = useMemo(() => ({ width: `${Math.max(share, 2)}%` }), [share])

  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
      <div className="h-full rounded-full bg-primary/80" style={widthStyle} />
    </div>
  )
}

function BreakdownCard({
  dimension,
  rows,
}: {
  dimension: BreakdownDimension
  rows: AnalyticsBreakdownRow[]
}) {
  const meta = DIMENSION_META[dimension]
  const entries = aggregateBreakdown(rows, dimension)

  return (
    <Card className={DASHBOARD_THEME.cards.base}>
      <CardHeader className={DASHBOARD_THEME.cards.header}>
        <div className="flex items-center gap-2">
          <meta.icon className="size-4 text-muted-foreground" />
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">{meta.title}</CardTitle>
            <CardDescription className="mt-1 text-xs text-muted-foreground">{meta.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No breakdown data for this range yet.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.label} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-foreground">{entry.label}</span>
                <span className="shrink-0 text-muted-foreground">{entry.share.toFixed(1)}%</span>
              </div>
              <BreakdownShareBar share={entry.share} />
              <p className="text-xs text-muted-foreground">
                {entry.sessions.toLocaleString()} sessions · {entry.users.toLocaleString()} users
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function AnalyticsBreakdownSection({ breakdowns }: { breakdowns?: AnalyticsBreakdownRow[] }) {
  if (!breakdowns?.length) return null

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">Acquisition breakdown</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Channel, source, and device mix from Google Analytics for the selected date range.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <BreakdownCard dimension="channel" rows={breakdowns} />
        <BreakdownCard dimension="source" rows={breakdowns} />
        <BreakdownCard dimension="device" rows={breakdowns} />
      </div>
    </section>
  )
}
