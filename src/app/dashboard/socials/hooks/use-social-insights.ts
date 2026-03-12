'use client'

import { useMemo } from 'react'
import type { SocialOverview } from './use-socials-metrics'

export type SocialKpi = {
  id: string
  label: string
  value: string
  detail: string
}

export type UseSocialInsightsReturn = {
  kpis: SocialKpi[]
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toLocaleString()
}

function formatRate(value: number): string {
  return `${value.toFixed(value >= 10 ? 1 : 2)}%`
}

export function useSocialInsights(overview: SocialOverview | null): UseSocialInsightsReturn {
  const kpis = useMemo<SocialKpi[]>(() => {
    const reach = overview?.reach ?? 0
    const impressions = overview?.impressions ?? 0
    const engagedUsers = overview?.engagedUsers ?? 0
    const followerDelta = overview?.followerDeltaTotal ?? 0
    const followerCount = overview?.followerCountLatest ?? null

    const engagementRate = reach > 0 ? (engagedUsers / reach) * 100 : 0
    const reachValue = formatNumber(reach)
    const impressionsValue = formatNumber(impressions)

    const followerDeltaDisplay =
      followerDelta >= 0
        ? `+${formatNumber(followerDelta)}`
        : `-${formatNumber(Math.abs(followerDelta))}`

    const followerDetail = followerCount !== null
      ? `${formatNumber(followerCount)} total followers this period`
      : followerDelta !== 0
        ? `Net follower change this period`
        : 'Connect and sync to track follower growth'

    return [
      {
        id: 'reach',
        label: 'Reach',
        value: reachValue,
        detail: reach > 0
          ? `${impressionsValue} total impressions this period`
          : 'Sync data to see reach metrics',
      },
      {
        id: 'impressions',
        label: 'Impressions',
        value: impressionsValue,
        detail: reach > 0
          ? `Avg ${(impressions / Math.max(reach, 1)).toFixed(1)}x per person reached`
          : 'Sync data to see impression metrics',
      },
      {
        id: 'engaged_users',
        label: 'Engaged Users',
        value: formatNumber(engagedUsers),
        detail: reach > 0
          ? `${formatRate(engagementRate)} engagement rate`
          : 'Sync data to see engagement metrics',
      },
      {
        id: 'follower_growth',
        label: 'Follower Growth',
        value: followerDelta !== 0 ? followerDeltaDisplay : '—',
        detail: followerDetail,
      },
    ]
  }, [overview])

  return { kpis }
}
