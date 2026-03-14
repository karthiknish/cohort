'use client'

import { Activity, ArrowUpRight, CalendarRange, DollarSign, Sparkles, TrendingUp, Users } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { GoogleAnalyticsStory } from '../lib/google-analytics-story'

function formatDeltaLabel(deltaPercent: number | null, direction: GoogleAnalyticsStory['deltas']['users']['direction']) {
  if (direction === 'new') return 'New in range'
  if (deltaPercent == null) return 'No prior data'
  return `${deltaPercent > 0 ? '+' : ''}${deltaPercent.toFixed(1)}% vs previous`
}

function formatDayLabel(value: string | null | undefined) {
  if (!value) return 'Not enough data'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function AnalyticsDeepDiveSection({ story }: { story: GoogleAnalyticsStory }) {
  const momentumVariant = story.momentum === 'up' ? 'success' : story.momentum === 'down' ? 'warning' : 'secondary'

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="overflow-hidden border-muted/40 bg-background shadow-sm">
        <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Performance context</CardTitle>
              <CardDescription className="mt-1 text-xs font-medium text-muted-foreground/60">A richer readout of how this property behaved over the selected range.</CardDescription>
            </div>
            <Badge variant={momentumVariant}>{story.momentum === 'up' ? 'Momentum up' : story.momentum === 'down' ? 'Momentum mixed' : 'Momentum steady'}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
          {[
            { key: 'users', label: 'Users', icon: Users, delta: story.deltas.users },
            { key: 'sessions', label: 'Sessions', icon: Activity, delta: story.deltas.sessions },
            { key: 'conversions', label: 'Conversions', icon: TrendingUp, delta: story.deltas.conversions },
            { key: 'revenue', label: 'Revenue', icon: DollarSign, delta: story.deltas.revenue },
          ].map((item) => (
            <div key={item.key} className="rounded-xl border border-muted/30 bg-muted/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </div>
              <p className="text-sm font-semibold text-foreground">{formatDeltaLabel(item.delta.deltaPercent, item.delta.direction)}</p>
              <p className="mt-1 text-xs text-muted-foreground">Previous range: {item.key === 'revenue' ? formatCurrency(item.delta.previous) : item.delta.previous.toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-muted/40 bg-background shadow-sm">
        <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Highlights</CardTitle>
          <CardDescription className="mt-1 text-xs font-medium text-muted-foreground/60">Best days and data coverage for this Google Analytics property.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-muted/30 bg-muted/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60"><CalendarRange className="h-3.5 w-3.5" />Coverage</div>
              <p className="text-lg font-semibold text-foreground">{Math.round(story.coverageRatio * 100)}%</p>
              <p className="text-xs text-muted-foreground">{story.activeDays} active day(s) in range</p>
            </div>
            <div className="rounded-xl border border-muted/30 bg-muted/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60"><ArrowUpRight className="h-3.5 w-3.5" />Peak sessions</div>
              <p className="text-lg font-semibold text-foreground">{story.topSessionsDay?.sessions.toLocaleString() ?? '—'}</p>
              <p className="text-xs text-muted-foreground">{formatDayLabel(story.topSessionsDay?.date)}</p>
            </div>
            <div className="rounded-xl border border-muted/30 bg-muted/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60"><Sparkles className="h-3.5 w-3.5" />Peak revenue</div>
              <p className="text-lg font-semibold text-foreground">{story.topRevenueDay ? formatCurrency(story.topRevenueDay.revenue) : '—'}</p>
              <p className="text-xs text-muted-foreground">{formatDayLabel(story.topRevenueDay?.date)}</p>
            </div>
          </div>
          <div className="rounded-xl border border-muted/30 bg-muted/5 p-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">Top conversion day</div>
            <p className="text-sm font-semibold text-foreground">{story.topConversionDay?.conversions.toLocaleString() ?? '—'} conversions on {formatDayLabel(story.topConversionDay?.date)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Use this day as a reference point when comparing landing pages, campaigns, or acquisition sources outside this dashboard.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}