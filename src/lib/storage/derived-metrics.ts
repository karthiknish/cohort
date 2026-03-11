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

export async function writeDerivedMetrics(options: { workspaceId: string; metrics: DerivedMetricInput[] }): Promise<{ written: number }> {
  void options
  throwDeprecated()
}

export async function writeDerivedMetric(options: { workspaceId: string; metric: DerivedMetricInput }): Promise<void> {
  void options
  throwDeprecated()
}

export async function queryDerivedMetrics(options: DerivedMetricsQueryOptions): Promise<DerivedMetricsQueryResult> {
  void options
  throwDeprecated()
}

export async function getDerivedMetricsByDateRange(options: {
  workspaceId: string
  providerId?: string
  startDate: string
  endDate: string
}): Promise<DerivedMetricRecord[]> {
  void options
  throwDeprecated()
}

export async function getLatestDerivedMetrics(options: {
  workspaceId: string
  providerId?: string
  limit?: number
}): Promise<DerivedMetricRecord[]> {
  void options
  throwDeprecated()
}

export async function deleteDerivedMetricsBeforeDate(options: { workspaceId: string; cutoffDate: string }): Promise<{ deleted: number }> {
  void options
  throwDeprecated()
}

export async function deleteDerivedMetric(options: {
  workspaceId: string
  providerId: string
  date: string
  metricId: string
  campaignId?: string
}): Promise<void> {
  void options
  throwDeprecated()
}
