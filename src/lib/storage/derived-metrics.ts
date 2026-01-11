// =============================================================================
// DERIVED METRICS STORAGE - Deprecated
// =============================================================================

import { ServiceUnavailableError } from '@/lib/api-errors'
import type {
  DerivedMetricInput,
  DerivedMetricsQueryOptions,
  DerivedMetricsQueryResult,
  DerivedMetricRecord,
} from './types'

function throwDeprecated(): never {
  throw new ServiceUnavailableError(
    'Client-side Firestore derived metrics storage has been removed. Use server API routes instead.'
  )
}

export async function writeDerivedMetrics(_options: { workspaceId: string; metrics: DerivedMetricInput[] }): Promise<{ written: number }> {
  throwDeprecated()
}

export async function writeDerivedMetric(_options: { workspaceId: string; metric: DerivedMetricInput }): Promise<void> {
  throwDeprecated()
}

export async function queryDerivedMetrics(_options: DerivedMetricsQueryOptions): Promise<DerivedMetricsQueryResult> {
  throwDeprecated()
}

export async function getDerivedMetricsByDateRange(_options: {
  workspaceId: string
  providerId?: string
  startDate: string
  endDate: string
}): Promise<DerivedMetricRecord[]> {
  throwDeprecated()
}

export async function getLatestDerivedMetrics(_options: {
  workspaceId: string
  providerId?: string
  limit?: number
}): Promise<DerivedMetricRecord[]> {
  throwDeprecated()
}

export async function deleteDerivedMetricsBeforeDate(_options: { workspaceId: string; cutoffDate: string }): Promise<{ deleted: number }> {
  throwDeprecated()
}

export async function deleteDerivedMetric(_options: {
  workspaceId: string
  providerId: string
  date: string
  metricId: string
  campaignId?: string
}): Promise<void> {
  throwDeprecated()
}
