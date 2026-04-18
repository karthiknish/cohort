// =============================================================================
// META ADS — Async Insights (Ad Report Run)
// =============================================================================
// Marketing API: POST act_{AD_ACCOUNT_ID}/insights → report_run_id, then poll
// GET {report_run_id} until Job Completed, then GET {report_run_id}/insights.
// Sync path remains `fetchMetaAdsMetrics` in metrics.ts; use this for heavy windows
// or when product wires long-running jobs (Convex cron, etc.).

import {
  appendMetaAuthParams,
  buildTimeRange,
  DEFAULT_RETRY_CONFIG,
  META_API_BASE,
  sleep,
} from './client'
import { metaAdsClient } from '../shared/base-client'
import type { MetaInsightsResponse, MetaInsightsRow, MetaPagingState } from './types'

function formatAdAccountId(adAccountId: string): string {
  return adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`
}

function parseReportRunId(payload: { report_run_id?: unknown; id?: unknown }): string | null {
  const fromField = payload?.report_run_id
  if (typeof fromField === 'string' && fromField.length > 0) return fromField
  if (typeof fromField === 'number' && Number.isFinite(fromField)) return String(fromField)

  const fromId = payload?.id
  if (typeof fromId === 'string' && fromId.length > 0) return fromId
  if (typeof fromId === 'number' && Number.isFinite(fromId)) return String(fromId)

  return null
}

const INSIGHT_FIELDS = [
  'date_start',
  'date_stop',
  'campaign_id',
  'campaign_name',
  'impressions',
  'clicks',
  'spend',
  'actions',
  'action_values',
  'account_currency',
].join(',')

export type MetaAsyncInsightsJobStatus =
  | 'Job Not Started'
  | 'Job Running'
  | 'Job Completed'
  | 'Job Failed'
  | 'Job Skipped'
  | (string & {})

export async function startMetaAccountInsightsReport(options: {
  accessToken: string
  adAccountId: string
  timeframeDays: number
  maxRetries?: number
}): Promise<{ reportRunId: string }> {
  const { accessToken, adAccountId, timeframeDays, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries } = options

  const timeRange = buildTimeRange(timeframeDays)
  const params = new URLSearchParams({
    level: 'campaign',
    fields: INSIGHT_FIELDS,
    time_range: JSON.stringify(timeRange),
    time_increment: '1',
    breakdowns: 'publisher_platform',
    limit: '500',
  })

  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const account = formatAdAccountId(adAccountId)
  const url = `${META_API_BASE}/${account}/insights`

  const { payload } = await metaAdsClient.executeRequest<{
    report_run_id?: unknown
    id?: unknown
    error?: { message?: string }
  }>({
    url,
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    operation: 'startMetaAccountInsightsReport',
    maxRetries,
  })

  if (payload?.error) {
    throw new Error(payload.error.message ?? 'Meta async insights: failed to start report')
  }

  const reportRunId = parseReportRunId(payload)
  if (!reportRunId) {
    throw new Error('Meta async insights: missing report_run_id in start response')
  }

  return { reportRunId }
}

export async function getMetaAsyncInsightsReportStatus(options: {
  accessToken: string
  reportRunId: string
  maxRetries?: number
}): Promise<{
  status: MetaAsyncInsightsJobStatus
  percentComplete: number
}> {
  const { accessToken, reportRunId, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries } = options

  const params = new URLSearchParams({
    fields: 'async_status,async_percent_completion,account_id',
  })
  await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

  const url = `${META_API_BASE}/${reportRunId}?${params.toString()}`

  const { payload } = await metaAdsClient.executeRequest<{
    async_status?: string
    async_percent_completion?: number
    error?: { message?: string }
  }>({
    url,
    operation: 'getMetaAsyncInsightsReportStatus',
    maxRetries,
  })

  if (payload?.error) {
    throw new Error(payload.error.message ?? 'Meta async insights: status request failed')
  }

  const status = (payload?.async_status ?? 'unknown') as MetaAsyncInsightsJobStatus
  const percentComplete =
    typeof payload?.async_percent_completion === 'number' && Number.isFinite(payload.async_percent_completion)
      ? payload.async_percent_completion
      : 0

  return { status, percentComplete }
}

export async function fetchMetaAsyncInsightsReportRows(options: {
  accessToken: string
  reportRunId: string
  maxPages?: number
  maxRetries?: number
}): Promise<MetaInsightsRow[]> {
  const { accessToken, reportRunId, maxPages = 25, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries } = options

  const rows: MetaInsightsRow[] = []
  let paging: MetaPagingState | undefined

  for (let page = 0; page < maxPages; page += 1) {
    const params = new URLSearchParams({ limit: '500' })
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET })

    if (paging?.after) {
      params.set('after', paging.after)
    }

    const url = `${META_API_BASE}/${reportRunId}/insights?${params.toString()}`

    const { payload } = await metaAdsClient.executeRequest<MetaInsightsResponse>({
      url,
      operation: `fetchMetaAsyncInsightsReportRows:page${page}`,
      maxRetries,
    })

    const batch = Array.isArray(payload?.data) ? payload.data : []
    rows.push(...batch)

    const nextCursor = payload?.paging?.cursors?.after ?? null
    const nextLink = payload?.paging?.next ?? null
    paging = nextCursor ? { after: nextCursor, next: nextLink ?? undefined } : undefined

    if (!paging?.after) break
  }

  return rows
}

export async function waitForMetaAsyncInsightsReport(options: {
  accessToken: string
  reportRunId: string
  maxWaitMs?: number
  pollIntervalMs?: number
  maxRetries?: number
}): Promise<{ status: MetaAsyncInsightsJobStatus }> {
  const {
    accessToken,
    reportRunId,
    maxWaitMs = 180_000,
    pollIntervalMs = 2_000,
    maxRetries,
  } = options

  const deadline = Date.now() + maxWaitMs

  while (Date.now() < deadline) {
    const { status } = await getMetaAsyncInsightsReportStatus({ accessToken, reportRunId, maxRetries })

    if (status === 'Job Completed') {
      return { status }
    }
    if (status === 'Job Failed' || status === 'Job Skipped') {
      throw new Error(`Meta async insights job finished with status: ${status}`)
    }

    await sleep(pollIntervalMs)
  }

  throw new Error('Meta async insights: timed out waiting for Job Completed')
}

/**
 * Convenience: start job, block until complete, return raw insight rows (same shape as sync insights).
 * For production sync, prefer start + store reportRunId + poll from a worker instead of blocking.
 */
export async function runMetaAccountInsightsReportToCompletion(options: {
  accessToken: string
  adAccountId: string
  timeframeDays: number
  maxWaitMs?: number
  pollIntervalMs?: number
  maxPages?: number
  maxRetries?: number
}): Promise<MetaInsightsRow[]> {
  const { reportRunId } = await startMetaAccountInsightsReport({
    accessToken: options.accessToken,
    adAccountId: options.adAccountId,
    timeframeDays: options.timeframeDays,
    maxRetries: options.maxRetries,
  })

  await waitForMetaAsyncInsightsReport({
    accessToken: options.accessToken,
    reportRunId,
    maxWaitMs: options.maxWaitMs,
    pollIntervalMs: options.pollIntervalMs,
    maxRetries: options.maxRetries,
  })

  return fetchMetaAsyncInsightsReportRows({
    accessToken: options.accessToken,
    reportRunId,
    maxPages: options.maxPages,
    maxRetries: options.maxRetries,
  })
}
