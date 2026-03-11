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
import type {
  SocialSurfaceKey,
  SocialsMetaSetupState,
  SocialsSurfaceAvailability,
  SocialsSurfaceStatus,
} from '../components/socials-state'

type MetaSurfaceActor = {
  id: string
  name: string
  tasks: string[]
  instagramBusinessAccountId: string | null
  instagramBusinessAccountName: string | null
  instagramUsername: string | null
}

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

  const metaNeedsAccountSelection = connections.metaNeedsAccountSelection
  const availableMetaSourceCount = connections.metaAccountOptions.length
  const selectedSourceName = metaStatus?.accountName ?? null

  const surfaceAvailability = useMemo<Record<SocialSurfaceKey, SocialsSurfaceAvailability>>(() => {
    const baseStatus = (count: number): SocialsSurfaceStatus => {
      if (!metaConnected) return 'disconnected'
      if (metaNeedsAccountSelection) return 'source_required'
      if (surfaceActorsLoading) return 'loading'
      if (surfaceActorsError) return 'error'
      return count > 0 ? 'ready' : 'empty'
    }

    const facebookCount = facebookPages.length
    const instagramCount = instagramProfiles.length

    return {
      facebook: {
        status: baseStatus(facebookCount),
        count: facebookCount,
        emptyMessage: !metaConnected
          ? 'Connect Meta to load Facebook Pages for this workspace.'
          : metaNeedsAccountSelection
            ? 'Choose the Meta source first so Facebook Pages can be discovered for this workspace.'
            : instagramCount > 0
              ? `${selectedSourceName ? `${selectedSourceName} loaded Instagram profiles` : 'The selected Meta source loaded Instagram profiles'}, but no Facebook Pages surfaced yet. This often means the wrong source is selected for Pages. Switch source or retry discovery.`
              : `${selectedSourceName ? `${selectedSourceName} is connected` : 'The selected Meta source is connected'}, but no Facebook Pages surfaced yet. Retry discovery or switch source if you expected Pages here.`,
      },
      instagram: {
        status: baseStatus(instagramCount),
        count: instagramCount,
        emptyMessage: !metaConnected
          ? 'Connect Meta to load Instagram business profiles for this workspace.'
          : metaNeedsAccountSelection
            ? 'Choose the Meta source first so Instagram business profiles can be discovered for this workspace.'
            : facebookCount > 0
              ? `${selectedSourceName ? `${selectedSourceName} loaded Facebook Pages` : 'The selected Meta source loaded Facebook Pages'}, but no Instagram business profiles surfaced yet. This often means the wrong source is selected for Instagram. Switch source or retry discovery.`
              : `${selectedSourceName ? `${selectedSourceName} is connected` : 'The selected Meta source is connected'}, but no Instagram business profiles surfaced yet. Retry discovery or switch source if you expected Instagram here.`,
      },
    }
  }, [facebookPages.length, instagramProfiles.length, metaConnected, metaNeedsAccountSelection, selectedSourceName, surfaceActorsError, surfaceActorsLoading])

  const metaSetupState = useMemo<SocialsMetaSetupState>(() => {
    if (!metaConnected) {
      return {
        stage: 'disconnected',
        title: 'Connect Meta to start social surface discovery',
        description: 'Authorize Meta once to unlock Facebook Pages, Instagram business profiles, and social performance insights for this workspace.',
        switchSourceRecommended: false,
        switchSourceMessage: null,
      }
    }

    if (metaNeedsAccountSelection) {
      return {
        stage: 'source_selection',
        title: 'Choose the Meta source behind these social surfaces',
        description: 'Your Meta login is connected. Select the ad account/source that should power Page and Instagram profile discovery before insights can populate here.',
        switchSourceRecommended: false,
        switchSourceMessage: null,
      }
    }

    if (surfaceActorsLoading) {
      return {
        stage: 'discovering',
        title: 'Discovering Facebook Pages and Instagram profiles',
        description: metaStatus?.accountName
          ? `Pulling connected social surfaces from ${metaStatus.accountName}. Keep this page open while discovery finishes.`
          : 'Pulling connected social surfaces from the selected Meta source. Keep this page open while discovery finishes.',
        switchSourceRecommended: false,
        switchSourceMessage: null,
      }
    }

    if (surfaceActorsError) {
      return {
        stage: 'recovery',
        title: 'Surface discovery needs attention',
        description: 'The selected Meta source could not finish loading Pages and Instagram profiles. Retry discovery or reload available sources to recover.',
        switchSourceRecommended: availableMetaSourceCount > 1,
        switchSourceMessage:
          availableMetaSourceCount > 1
            ? 'If this source looks wrong for the workspace, switch to another Meta source below before retrying discovery again.'
            : null,
      }
    }

    if (facebookPages.length > 0 && instagramProfiles.length > 0) {
      return {
        stage: 'ready',
        title: 'Facebook and Instagram surfaces are ready',
        description: 'Both Pages and Instagram business profiles loaded from the selected Meta source. You can switch between surfaces below without leaving setup.',
        switchSourceRecommended: false,
        switchSourceMessage: null,
      }
    }

    if (facebookPages.length > 0 || instagramProfiles.length > 0) {
      return {
        stage: 'partial',
        title: facebookPages.length > 0 ? 'Facebook is ready, Instagram still needs attention' : 'Instagram is ready, Facebook still needs attention',
        description: facebookPages.length > 0
          ? 'Facebook Pages loaded from the selected Meta source, but no Instagram business profiles surfaced yet. Retry discovery or choose another source if Instagram should be available.'
          : 'Instagram business profiles loaded from the selected Meta source, but no Facebook Pages surfaced yet. Retry discovery or choose another source if Pages should be available.',
        switchSourceRecommended: availableMetaSourceCount > 1,
        switchSourceMessage:
          availableMetaSourceCount > 1
            ? facebookPages.length > 0
              ? 'If you expected Instagram here, switch the Meta source below. The current source is only surfacing Facebook Pages.'
              : 'If you expected Facebook Pages here, switch the Meta source below. The current source is only surfacing Instagram business profiles.'
            : null,
      }
    }

    return {
      stage: 'connected_empty',
      title: 'Meta is connected, but no social surfaces have surfaced yet',
      description: 'The selected Meta source is linked, but no Facebook Pages or Instagram business profiles were discovered yet. Retry discovery or reload sources if you expected them here.',
      switchSourceRecommended: availableMetaSourceCount > 1,
      switchSourceMessage:
        availableMetaSourceCount > 1
          ? 'If the selected source should have loaded surfaces by now, switch to another Meta source below and retry discovery.'
          : null,
    }
  }, [availableMetaSourceCount, facebookPages.length, instagramProfiles.length, metaConnected, metaNeedsAccountSelection, metaStatus?.accountName, surfaceActorsError, surfaceActorsLoading])

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
    metaSetupState,
    surfaceAvailability,
    surfaceActorsLoading,
    surfaceActorsError,
    reloadSurfaceActors,
  }
}
