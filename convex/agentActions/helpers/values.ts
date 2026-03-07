import type { ProviderId, ReportPeriod } from '../types'
import { OPERATION_ALIASES, PROPOSAL_STATUSES } from '../types'

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function asString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => asNonEmptyString(item))
      .filter((item): item is string => item !== null)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.length > 0)
  }

  return []
}

function toStringRecord(value: unknown): Record<string, string> {
  const record = asRecord(value)
  if (!record) return {}

  return Object.entries(record).reduce<Record<string, string>>((acc, [key, item]) => {
    if (typeof item === 'string') {
      acc[key] = item
    }
    return acc
  }, {})
}

function normalizeOperationName(operation: string): string {
  const raw = operation.trim()
  const aliasKey = raw.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return OPERATION_ALIASES[aliasKey] ?? raw
}

function normalizeProviderId(value: unknown): ProviderId | null {
  const normalized = asNonEmptyString(value)?.toLowerCase()
  if (!normalized) return null

  if (normalized === 'google' || normalized === 'tiktok' || normalized === 'linkedin') {
    return normalized
  }

  if (normalized === 'facebook' || normalized === 'meta') {
    return 'facebook'
  }

  return null
}

function normalizeProviderIds(value: unknown): ProviderId[] {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : []

  const providers = rawValues
    .map((item) => normalizeProviderId(item))
    .filter((item): item is ProviderId => item !== null)

  return Array.from(new Set(providers))
}

function normalizeReportPeriod(value: unknown): ReportPeriod {
  const normalized = asNonEmptyString(value)?.toLowerCase()
  if (normalized === 'daily') return 'daily'
  if (normalized === 'monthly') return 'monthly'
  return 'weekly'
}

function normalizeProposalStatus(value: unknown): string | null {
  const normalized = asNonEmptyString(value)?.toLowerCase()
  if (!normalized) return null
  return PROPOSAL_STATUSES.has(normalized) ? normalized : null
}

function normalizeCampaignAction(value: unknown): 'enable' | 'pause' | 'updateBudget' | 'updateBidding' | 'remove' | null {
  const normalized = asNonEmptyString(value)?.toLowerCase()
  if (!normalized) return null

  if (normalized === 'enable' || normalized === 'resume' || normalized === 'active') return 'enable'
  if (normalized === 'pause' || normalized === 'paused' || normalized === 'disable' || normalized === 'disabled') {
    return 'pause'
  }
  if (normalized === 'updatebudget' || normalized === 'budget') return 'updateBudget'
  if (normalized === 'updatebidding' || normalized === 'bidding') return 'updateBidding'
  if (normalized === 'remove' || normalized === 'delete') return 'remove'

  return null
}

function normalizeCreativeStatus(value: unknown): 'ACTIVE' | 'PAUSED' {
  const normalized = asNonEmptyString(value)?.toLowerCase()
  if (normalized === 'active' || normalized === 'enable' || normalized === 'enabled') return 'ACTIVE'
  return 'PAUSED'
}

function unwrapConvexResult(value: unknown): unknown {
  const record = asRecord(value)
  if (record && record.ok === true && 'data' in record) {
    return record.data
  }
  return value
}

function asErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Unknown error'
}

export {
  asErrorMessage,
  asNonEmptyString,
  asNumber,
  asRecord,
  asString,
  asStringArray,
  normalizeCampaignAction,
  normalizeCreativeStatus,
  normalizeOperationName,
  normalizeProposalStatus,
  normalizeProviderId,
  normalizeProviderIds,
  normalizeReportPeriod,
  toStringRecord,
  unwrapConvexResult,
}