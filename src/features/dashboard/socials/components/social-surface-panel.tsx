'use client'

import { useCallback } from 'react'
import { Facebook, Instagram } from 'lucide-react'

import { cn } from '@/lib/utils'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { EmptyState } from '@/shared/ui/empty-state'
import { Skeleton } from '@/shared/ui/skeleton'
import { SocialsKpiGrid } from './socials-kpi-grid'
import type { SocialKpi } from '../hooks/use-social-insights'

type SocialSurfacePanelProps = {
  surface: 'facebook' | 'instagram'
  kpis: SocialKpi[]
  overviewLoading: boolean
  connected: boolean
}

const SURFACE_COPY = {
  facebook: {
    title: 'Facebook',
    icon: Facebook,
    summaryTitle: 'Facebook organic performance',
    summaryDescription: 'Organic reach, engagement, and follower growth for Facebook Pages in this workspace.',
    emptyMessage: 'Connect Facebook to start syncing organic metrics for this workspace.',
    emptyCtaLabel: 'Connect Facebook',
  },
  instagram: {
    title: 'Instagram',
    icon: Instagram,
    summaryTitle: 'Instagram organic performance',
    summaryDescription: 'Organic reach, engagement, and follower growth for Instagram business profiles in this workspace.',
    emptyMessage: 'Connect Instagram to start syncing organic metrics for this workspace.',
    emptyCtaLabel: 'Connect Instagram',
  },
} as const

export function SocialSurfacePanel({
  surface,
  kpis,
  overviewLoading,
  connected,
}: SocialSurfacePanelProps) {
  const copy = SURFACE_COPY[surface]
  const SurfaceIcon = copy.icon
  const handleScrollToConnections = useCallback(() => {
    document.getElementById('social-connections-panel')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="space-y-6">
      <Card className={cn('overflow-hidden', DASHBOARD_THEME.cards.base)}>
        <CardHeader className={DASHBOARD_THEME.cards.header}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className={DASHBOARD_THEME.icons.container}>
                <SurfaceIcon className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">{copy.summaryTitle}</CardTitle>
                <CardDescription>{copy.summaryDescription}</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className={cn(DASHBOARD_THEME.badges.base, 'w-fit')}>
              {overviewLoading ? 'Loading…' : connected ? 'Organic data' : 'Not connected'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {overviewLoading ? (
            <div className={DASHBOARD_THEME.stats.container}>
              {[0, 1, 2, 3].map((slot) => (
                <Skeleton key={slot} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : connected ? (
            <SocialsKpiGrid items={kpis} />
          ) : (
            <EmptyState
              title={`${copy.title} not connected`}
              description={copy.emptyMessage}
              action={{ label: copy.emptyCtaLabel, onClick: handleScrollToConnections }}
              variant="card"
              className="rounded-2xl"
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
