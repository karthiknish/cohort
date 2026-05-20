import { formatDate } from '@/lib/dates'
import { appendMetaAuthParams, buildTimeRange, META_API_BASE } from './client'
import { metaAdsClient } from '../shared/base-client'
import { buildOrganicMetricRow, type OrganicSocialDailyMetric } from './types'

const FACEBOOK_DAILY_METRICS = [
  'page_impressions',
  'page_impressions_unique',
  'page_post_engagements',
  'page_actions_post_reactions_total',
  'page_actions_post_comments',
  'page_actions_post_shares',
].join(',')

type InsightValue = { value?: unknown; end_time?: string }

function parseInsightValues(data: Array<{ name?: string; values?: InsightValue[] }> | undefined) {
  const byName = new Map<string, Map<string, number>>()

  for (const metric of data ?? []) {
    const name = typeof metric?.name === 'string' ? metric.name : null
    if (!name) continue

    const dateMap = new Map<string, number>()
    for (const point of metric.values ?? []) {
      const endTime = typeof point?.end_time === 'string' ? point.end_time : null
      if (!endTime) continue
      const date = endTime.slice(0, 10)
      const value = typeof point?.value === 'number' ? point.value : Number(point?.value ?? 0)
      dateMap.set(date, Number.isFinite(value) ? value : 0)
    }
    byName.set(name, dateMap)
  }

  return byName
}

function getMetricValue(byName: Map<string, Map<string, number>>, metric: string, date: string): number {
  return byName.get(metric)?.get(date) ?? 0
}

export async function fetchFacebookPageDailyInsights(options: {
  accessToken: string
  pageId: string
  pageName: string | null
  timeframeDays: number
  appSecret?: string | null
  maxRetries?: number
}): Promise<OrganicSocialDailyMetric[]> {
  const { accessToken, pageId, pageName, timeframeDays, appSecret, maxRetries } = options
  const range = buildTimeRange(timeframeDays)

  const params = new URLSearchParams({
    metric: FACEBOOK_DAILY_METRICS,
    period: 'day',
    since: range.since,
    until: range.until,
  })

  await appendMetaAuthParams({ params, accessToken, appSecret })

  const { payload } = await metaAdsClient.executeRequest<{
    data?: Array<{ name?: string; values?: InsightValue[] }>
  }>({
    url: `${META_API_BASE}/${pageId}/insights?${params.toString()}`,
    operation: 'fetchFacebookPageDailyInsights',
    maxRetries,
  })

  const byName = parseInsightValues(payload?.data)
  const dates = new Set<string>()
  for (const dateMap of byName.values()) {
    for (const date of dateMap.keys()) dates.add(date)
  }

  const rows: OrganicSocialDailyMetric[] = []

  for (const date of [...dates].sort()) {
    const impressions = getMetricValue(byName, 'page_impressions', date)
    const reach = getMetricValue(byName, 'page_impressions_unique', date)
    const engagedUsers = getMetricValue(byName, 'page_post_engagements', date)
    const reactions = getMetricValue(byName, 'page_actions_post_reactions_total', date)
    const comments = getMetricValue(byName, 'page_actions_post_comments', date)
    const shares = getMetricValue(byName, 'page_actions_post_shares', date)

    rows.push(
      buildOrganicMetricRow({
        surface: 'facebook',
        entityId: pageId,
        entityName: pageName,
        date,
        impressions,
        reach,
        engagedUsers,
        reactions,
        comments,
        shares,
        rawPayload: { metrics: Object.fromEntries([...byName.entries()].map(([k, v]) => [k, v.get(date)])) },
      }),
    )
  }

  return rows
}

/** ISO date helper for tests */
export function formatInsightDate(date: Date): string {
  return formatDate(date, 'yyyy-MM-dd')
}
