'use client'

import { useMemo, useState } from 'react'
import { subDays, startOfDay, endOfDay } from 'date-fns'
import { useConvexAuth, useQuery } from 'convex/react'

import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { socialMetricsApi } from '@/lib/convex-api'
import type { DateRange } from '@/app/dashboard/ads/components/date-range-picker'

export type SocialOverview = {
  surface: string
  impressions: number
  reach: number
  engagedUsers: number
  reactions: number
  comments: number
  shares: number
  saves: number
  followerCountLatest: number | null
  followerDeltaTotal: number
  rowCount: number
}

export type UseSocialsMetricsReturn = {
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
  facebookOverview: SocialOverview | null
  instagramOverview: SocialOverview | null
  overviewLoading: boolean
}

function defaultDateRange(): DateRange {
  const now = new Date()
  return {
    start: startOfDay(subDays(now, 29)),
    end: endOfDay(now),
  }
}

export function useSocialsMetrics(): UseSocialsMetricsReturn {
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()

  const [dateRange, setDateRange] = useState<DateRange>(defaultDateRange)

  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const canQuery = isAuthenticated && !convexAuthLoading && Boolean(workspaceId)

  const startDate = dateRange.start.toISOString().split('T')[0] ?? ''
  const endDate = dateRange.end.toISOString().split('T')[0] ?? ''

  const baseArgs = canQuery && workspaceId
    ? { workspaceId, clientId: selectedClientId ?? null, startDate, endDate }
    : 'skip' as const

  const facebookRaw = useQuery(
    socialMetricsApi.listOverview,
    baseArgs === 'skip' ? 'skip' : { ...baseArgs, surface: 'facebook' as const }
  )

  const instagramRaw = useQuery(
    socialMetricsApi.listOverview,
    baseArgs === 'skip' ? 'skip' : { ...baseArgs, surface: 'instagram' as const }
  )

  const overviewLoading =
    canQuery && (facebookRaw === undefined || instagramRaw === undefined)

  const facebookOverview = useMemo<SocialOverview | null>(
    () => (facebookRaw ? { ...facebookRaw } : null),
    [facebookRaw],
  )

  const instagramOverview = useMemo<SocialOverview | null>(
    () => (instagramRaw ? { ...instagramRaw } : null),
    [instagramRaw],
  )

  return {
    dateRange,
    setDateRange,
    facebookOverview,
    instagramOverview,
    overviewLoading,
  }
}
