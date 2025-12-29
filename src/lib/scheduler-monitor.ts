import { FieldValue } from 'firebase-admin/firestore'

import { adminDb } from '@/lib/firebase-admin'

const ALERT_WEBHOOK_URL = process.env.SCHEDULER_ALERT_WEBHOOK_URL
const DEFAULT_FAILURE_THRESHOLD = Number(process.env.SCHEDULER_ALERT_FAILURE_THRESHOLD ?? '3')

export type SchedulerEventSource = 'worker' | 'cron'
export type SchedulerEventSeverity = 'info' | 'warning' | 'critical'

export interface SchedulerEventInput {
  source: SchedulerEventSource
  operation?: string | null
  processedJobs: number
  successfulJobs: number
  failedJobs: number
  hadQueuedJobs?: boolean
  inspectedQueuedJobs?: number
  durationMs?: number
  notes?: string | null
  errors?: string[]
  failureThresholdOverride?: number | null
  providerFailureThresholds?: Array<{
    providerId: string
    failedJobs: number
    threshold: number | null
  }>
}

function resolveThreshold(input: SchedulerEventInput): number {
  if (typeof input.failureThresholdOverride === 'number' && Number.isFinite(input.failureThresholdOverride) && input.failureThresholdOverride >= 1) {
    return input.failureThresholdOverride
  }
  return Math.max(1, DEFAULT_FAILURE_THRESHOLD)
}

function determineSeverity(input: SchedulerEventInput): SchedulerEventSeverity {
  const providerThresholds = (input.providerFailureThresholds ?? []).map((entry) => ({
    providerId: entry.providerId,
    failedJobs: entry.failedJobs,
    threshold:
      typeof entry.threshold === 'number' && Number.isFinite(entry.threshold) && entry.threshold >= 1
        ? entry.threshold
        : Math.max(1, DEFAULT_FAILURE_THRESHOLD),
  }))

  if (providerThresholds.length > 0) {
    if (
      providerThresholds.some((entry) => {
        const threshold = entry.threshold
        return entry.failedJobs >= threshold
      })
    ) {
      return 'critical'
    }

    if (providerThresholds.some((entry) => entry.failedJobs > 0)) {
      return 'warning'
    }
  }

  const threshold = resolveThreshold(input)

  if (input.failedJobs >= threshold) {
    return 'critical'
  }

  if (input.failedJobs > 0 || (input.hadQueuedJobs && input.processedJobs === 0)) {
    return 'warning'
  }

  return 'info'
}

function buildAlertMessage(input: SchedulerEventInput, severity: SchedulerEventSeverity): string {
  const segments: string[] = [
    `Scheduler ${input.source} run reported ${severity.toUpperCase()}.`,
    `Processed: ${input.processedJobs}`,
    `Succeeded: ${input.successfulJobs}`,
    `Failed: ${input.failedJobs}`,
  ]

  const threshold = resolveThreshold(input)
  if (threshold !== DEFAULT_FAILURE_THRESHOLD) {
    segments.push(`Failure threshold: ${threshold}`)
  }

  if (input.providerFailureThresholds?.length) {
    const details = input.providerFailureThresholds
      .map((entry) => `${entry.providerId}:${entry.failedJobs}/${entry.threshold ?? 'default'}`)
      .join(', ')
    segments.push(`Per-provider: ${details}`)
  }

  if (input.hadQueuedJobs) {
    segments.push(`Queued observed: ${input.inspectedQueuedJobs ?? 'unknown'}`)
  }

  if (typeof input.durationMs === 'number') {
    segments.push(`Duration: ${Math.round(input.durationMs)}ms`)
  }

  if (input.operation) {
    segments.push(`Operation: ${input.operation}`)
  }

  if (input.notes) {
    segments.push(`Notes: ${input.notes}`)
  }

  if (input.errors?.length) {
    segments.push(`Errors: ${input.errors.slice(0, 3).join(' | ')}`)
  }

  return segments.join(' \n ')
}

async function sendAlert(message: string, severity: SchedulerEventSeverity): Promise<void> {
  if (!ALERT_WEBHOOK_URL) {
    return
  }

  try {
    await fetch(ALERT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        severity,
        message,
        source: 'scheduler',
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('[scheduler-monitor] failed to dispatch webhook alert', error)
  }
}

export async function recordSchedulerEvent(input: SchedulerEventInput): Promise<void> {
  const severity = determineSeverity(input)
  const safeErrors = Array.isArray(input.errors)
    ? input.errors.filter((item) => typeof item === 'string' && item.trim().length > 0).slice(0, 10)
    : []

  const payload = {
    source: input.source,
    operation: input.operation ?? null,
    processedJobs: input.processedJobs,
    successfulJobs: input.successfulJobs,
    failedJobs: input.failedJobs,
    hadQueuedJobs: Boolean(input.hadQueuedJobs),
    inspectedQueuedJobs: typeof input.inspectedQueuedJobs === 'number' ? input.inspectedQueuedJobs : null,
    durationMs: typeof input.durationMs === 'number' ? input.durationMs : null,
    notes: input.notes ?? null,
    errors: safeErrors,
    failureThreshold: resolveThreshold(input),
    providerFailureThresholds: (input.providerFailureThresholds ?? []).map((entry) => ({
      providerId: entry.providerId,
      failedJobs: entry.failedJobs,
      threshold:
        typeof entry.threshold === 'number' && Number.isFinite(entry.threshold) && entry.threshold >= 0
          ? entry.threshold
          : null,
    })),
    severity,
    createdAt: FieldValue.serverTimestamp(),
  }

  try {
    await adminDb
      .collection('admin')
      .doc('scheduler')
      .collection('events')
      .add(payload)
  } catch (error) {
    console.error('[scheduler-monitor] failed to persist event', error)
  }

  if (severity === 'warning' || severity === 'critical') {
    const message = buildAlertMessage(input, severity)
    await sendAlert(message, severity)
  }
}
