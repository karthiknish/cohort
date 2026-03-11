'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAction } from 'convex/react'

import { useClientContext } from '@/contexts/client-context'
import { PROVIDER_IDS } from '@/lib/themes'
import { useAdsConnections } from '@/app/dashboard/ads/hooks/use-ads-connections'
import { useAdsMetrics } from '@/app/dashboard/ads/hooks/use-ads-metrics'
import { useAlgorithmicInsights } from '@/app/dashboard/ads/hooks/use-algorithmic-insights'
import type { ProviderSummary } from '@/app/dashboard/ads/components/types'
import { useAuth } from '@/contexts/auth-context'
import { adsCreativesApi } from '@/lib/convex-api'

type MetaSurfaceActor = {
  id: string
  name: string
  tasks: string[]
  instagramBusinessAccountId: string | null
  instagramBusinessAccountName: string | null
  instagramUsername: string | null
}

type SocialSurfaceKey = 'facebook' | 'instagram'

type SocialSurfaceState = {
  metrics: ReturnType<typeof useAdsMetrics>['processedMetrics']
  providerSummaries: Record<string, ProviderSummary>
  kpis: Array<{ id: string; label: string; value: string; detail: string }>
}

function formatPercent(value: number): string {
  return `${value.toFixed(value >= 10 ? 1 : 2)}%`
}

function formatMultiplier(value: number): string {
  return `${value.toFixed(value >= 10 ? 1 : 2)}x`
}

function buildProviderSummary(metrics: ReturnType<typeof useAdsMetrics>['processedMetrics']): ProviderSummary | null {
  if (metrics.length === 0) {
    return null
  }

  return metrics.reduce<ProviderSummary>(
    (summary, metric) => {
      summary.spend += metric.spend
      summary.impressions += metric.impressions
      summary.clicks += metric.clicks
      summary.conversions += metric.conversions
      summary.revenue += metric.revenue ?? 0
      return summary
    },
    { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 },
  )
}

function buildKpis(
  summary: ProviderSummary | null,
  efficiencyScore: number,
  insightCount: number,
): SocialSurfaceState['kpis'] {
  const spend = summary?.spend ?? 0
  const clicks = summary?.clicks ?? 0
  const impressions = summary?.impressions ?? 0
  const conversions = summary?.conversions ?? 0
  const revenue = summary?.revenue ?? 0
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0
  const roas = spend > 0 ? revenue / spend : 0
  const cpa = conversions > 0 ? spend / conversions : 0

  return [
    {
      id: 'ctr',
      label: 'CTR',
      value: formatPercent(ctr),
      detail: `${clicks.toLocaleString()} clicks from ${impressions.toLocaleString()} impressions`,
    },
    {
      id: 'roas',
      label: 'ROAS',
      value: formatMultiplier(roas),
      detail: spend > 0 ? 'Revenue efficiency from paid social' : 'Connect an account to calculate ROAS',
    },
    {
      id: 'cpa',
      label: 'Cost per Conversion',
      value:
        conversions > 0
          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cpa)
          : '—',
      detail: conversions > 0 ? `${conversions.toLocaleString()} tracked conversions` : 'No conversion data yet',
    },
    {
      id: 'efficiency',
      label: 'AI Score',
      value: `${efficiencyScore}/100`,
      detail: insightCount > 0 ? `${insightCount} active recommendations` : 'Waiting for enough signal',
    },
  ]
}

export function useSocialsPageController() {
  const { selectedClient } = useClientContext()
  const { user } = useAuth()
  const metrics = useAdsMetrics()
  const connections = useAdsConnections({
    onRefresh: metrics.triggerRefresh,
  })
  const listMetaPageActors = useAction(adsCreativesApi.listMetaPageActors)
  const [surfaceActors, setSurfaceActors] = useState<MetaSurfaceActor[]>([])
  const [surfaceActorsLoading, setSurfaceActorsLoading] = useState(false)
  const [surfaceActorsError, setSurfaceActorsError] = useState<string | null>(null)

  const socialMetrics = useMemo(
    () =>
      metrics.processedMetrics.filter(
        (metric) =>
          metric.providerId === PROVIDER_IDS.FACEBOOK || metric.providerId === PROVIDER_IDS.META,
      ),
    [metrics.processedMetrics],
  )

  const facebookMetrics = useMemo(
    () =>
      socialMetrics.filter(
        (metric) => metric.publisherPlatform === 'facebook' || metric.publisherPlatform === 'messenger',
      ),
    [socialMetrics],
  )

  const instagramMetrics = useMemo(
    () => socialMetrics.filter((metric) => metric.publisherPlatform === 'instagram'),
    [socialMetrics],
  )

  const facebookSummary = useMemo(() => buildProviderSummary(facebookMetrics), [facebookMetrics])
  const instagramSummary = useMemo(() => buildProviderSummary(instagramMetrics), [instagramMetrics])

  const facebookProviderSummaries = useMemo<Record<string, ProviderSummary>>(
    () =>
      facebookSummary
        ? { [PROVIDER_IDS.FACEBOOK]: facebookSummary }
        : ({} as Record<string, ProviderSummary>),
    [facebookSummary],
  )
  const instagramProviderSummaries = useMemo<Record<string, ProviderSummary>>(
    () =>
      instagramSummary
        ? { [PROVIDER_IDS.FACEBOOK]: instagramSummary }
        : ({} as Record<string, ProviderSummary>),
    [instagramSummary],
  )

  const facebookSuggestions = useAlgorithmicInsights({
    metrics: facebookMetrics,
    providerSummaries: facebookProviderSummaries,
    loading: metrics.metricsLoading,
  })

  const instagramSuggestions = useAlgorithmicInsights({
    metrics: instagramMetrics,
    providerSummaries: instagramProviderSummaries,
    loading: metrics.metricsLoading,
  })

  const metaConnected = Boolean(connections.connectedProviders[PROVIDER_IDS.FACEBOOK])
  const metaStatus = connections.integrationStatusMap[PROVIDER_IDS.FACEBOOK] ?? null
  const lastSyncedAt = metaStatus?.lastSyncedAt ?? null
  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const loadSurfaceActors = useCallback(() => {
    if (!metaConnected || !workspaceId) {
      setSurfaceActors([])
      setSurfaceActorsLoading(false)
      setSurfaceActorsError(null)
      return Promise.resolve()
    }

    setSurfaceActorsLoading(true)
    setSurfaceActorsError(null)

    return listMetaPageActors({
      workspaceId,
      providerId: 'facebook',
      clientId: selectedClient?.id ?? null,
    })
      .then((actors) => {
        setSurfaceActors(Array.isArray(actors) ? (actors as MetaSurfaceActor[]) : [])
      })
      .catch((error) => {
        setSurfaceActors([])
        setSurfaceActorsError(error instanceof Error ? error.message : 'Unable to load connected Meta surfaces.')
      })
      .finally(() => {
        setSurfaceActorsLoading(false)
      })
  }, [listMetaPageActors, metaConnected, selectedClient?.id, workspaceId])

  const reloadSurfaceActors = useCallback(() => {
    void loadSurfaceActors()
  }, [loadSurfaceActors])

  useEffect(() => {
    void loadSurfaceActors()
  }, [loadSurfaceActors])

  const facebookPages = useMemo(
    () => surfaceActors.map((actor) => ({ id: actor.id, name: actor.name, tasks: actor.tasks })),
    [surfaceActors],
  )

  const instagramProfiles = useMemo(() => {
    const seen = new Set<string>()

    return surfaceActors.flatMap((actor) => {
      const profileId = actor.instagramBusinessAccountId
      if (!profileId || seen.has(profileId)) {
        return []
      }

      seen.add(profileId)

      return [
        {
          id: profileId,
          name:
            actor.instagramBusinessAccountName ??
            actor.instagramUsername ??
            'Instagram business profile',
          username: actor.instagramUsername,
        },
      ]
    })
  }, [surfaceActors])

  const surfaceData = useMemo<Record<SocialSurfaceKey, SocialSurfaceState>>(
    () => ({
      facebook: {
        metrics: facebookMetrics,
        providerSummaries: facebookProviderSummaries,
        kpis: buildKpis(
          facebookSummary,
          facebookSuggestions.providerEfficiencyScores[PROVIDER_IDS.FACEBOOK] ??
            facebookSuggestions.globalEfficiencyScore,
          facebookSuggestions.insights.length,
        ),
      },
      instagram: {
        metrics: instagramMetrics,
        providerSummaries: instagramProviderSummaries,
        kpis: buildKpis(
          instagramSummary,
          instagramSuggestions.providerEfficiencyScores[PROVIDER_IDS.FACEBOOK] ??
            instagramSuggestions.globalEfficiencyScore,
          instagramSuggestions.insights.length,
        ),
      },
    }),
    [
      facebookMetrics,
      facebookProviderSummaries,
      facebookSummary,
      facebookSuggestions.globalEfficiencyScore,
      facebookSuggestions.insights.length,
      facebookSuggestions.providerEfficiencyScores,
      instagramMetrics,
      instagramProviderSummaries,
      instagramSummary,
      instagramSuggestions.globalEfficiencyScore,
      instagramSuggestions.insights.length,
      instagramSuggestions.providerEfficiencyScores,
    ],
  )

  return {
    selectedClient,
    metrics,
    connections,
    metaConnected,
    metaStatus,
    lastSyncedAt,
    socialMetrics,
    surfaceData,
    facebookSuggestions,
    instagramSuggestions,
    facebookPages,
    instagramProfiles,
    surfaceActorsLoading,
    surfaceActorsError,
    reloadSurfaceActors,
  }
}
