'use client'

import { useClientContext } from '@/shared/contexts/client-context'
import type { DateRange } from '@/features/dashboard/ads/components/date-range-picker'
import { useSocialsConnections } from './use-socials-connections'
import { useSocialsSetup } from './use-socials-setup'
import { useSocialsMetrics } from './use-socials-metrics'
import { useSocialInsights } from './use-social-insights'
import type { SocialKpi } from './use-social-insights'
import type { UseSocialsConnectionsReturn } from './use-socials-connections'
import type { UseSocialsSetupReturn } from './use-socials-setup'
import type { UseSocialsMetricsReturn } from './use-socials-metrics'

export type SocialsPageData = {
  selectedClient: ReturnType<typeof useClientContext>['selectedClient']
  connections: UseSocialsConnectionsReturn
  setup: UseSocialsSetupReturn
  metrics: UseSocialsMetricsReturn
  facebookKpis: SocialKpi[]
  instagramKpis: SocialKpi[]
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
}

export function useSocialsPageController(): SocialsPageData {
  const { selectedClient } = useClientContext()

  const connections = useSocialsConnections()
  const setup = useSocialsSetup(connections.status)
  const metrics = useSocialsMetrics()

  const { kpis: facebookKpis } = useSocialInsights(metrics.facebookOverview)
  const { kpis: instagramKpis } = useSocialInsights(metrics.instagramOverview)

  return {
    selectedClient,
    connections,
    setup,
    metrics,
    facebookKpis,
    instagramKpis,
    dateRange: metrics.dateRange,
    setDateRange: metrics.setDateRange,
  }
}
