'use client'

import { useClientContext } from '@/shared/contexts/client-context'
import type { DateRange } from '@/features/dashboard/ads/components/date-range-picker'
import { useSocialsConnections } from './use-socials-connections'
import { useSocialsMetrics } from './use-socials-metrics'
import { useSocialInsights } from './use-social-insights'
import type { SocialKpi } from './use-social-insights'
import type { UseSocialsConnectionsReturn } from './use-socials-connections'
import type { UseSocialsMetricsReturn } from './use-socials-metrics'

export type SocialsPageData = {
  selectedClient: ReturnType<typeof useClientContext>['selectedClient']
  connections: UseSocialsConnectionsReturn
  metrics: UseSocialsMetricsReturn
  facebookKpis: SocialKpi[]
  instagramKpis: SocialKpi[]
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
}

export function useSocialsPageController(): SocialsPageData {
  const { selectedClient } = useClientContext()

  const connections = useSocialsConnections()
  const metrics = useSocialsMetrics()

  const { kpis: facebookKpis } = useSocialInsights(metrics.facebookOverview)
  const { kpis: instagramKpis } = useSocialInsights(metrics.instagramOverview)

  return {
    selectedClient,
    connections,
    metrics,
    facebookKpis,
    instagramKpis,
    dateRange: metrics.dateRange,
    setDateRange: metrics.setDateRange,
  }
}
