import { z } from 'zod'

import { MILESTONE_STATUSES, type MilestoneRecord, type MilestoneStatus } from '@/types/milestones'
import { toISO } from '@/lib/utils'

export const milestoneStatusSchema = z.enum(MILESTONE_STATUSES)

export type StoredMilestone = {
  title?: unknown
  description?: unknown
  status?: unknown
  startDate?: unknown
  endDate?: unknown
  ownerId?: unknown
  order?: unknown
  createdAt?: unknown
  updatedAt?: unknown
  projectId?: unknown
}

export function mapMilestoneDoc(docId: string, data: StoredMilestone): MilestoneRecord {
  const status = (typeof data.status === 'string' ? data.status : 'planned') as MilestoneStatus
  const normalizedStatus = MILESTONE_STATUSES.includes(status) ? status : 'planned'

  return {
    id: docId,
    projectId: typeof data.projectId === 'string' ? data.projectId : '',
    title: typeof data.title === 'string' && data.title.trim() ? data.title.trim() : 'Untitled milestone',
    description: typeof data.description === 'string' ? data.description : null,
    status: normalizedStatus,
    startDate: toISO(data.startDate),
    endDate: toISO(data.endDate),
    ownerId: typeof data.ownerId === 'string' ? data.ownerId : null,
    order: typeof data.order === 'number' ? data.order : null,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
  }
}

/**
 * Normalizes a date string to milliseconds.
 * Returns null if the value is empty or invalid.
 */
export function normalizeDateToMs(value: string | null | undefined): number | null {
  if (value === undefined || value === null) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date')
  }
  return parsed.getTime()
}
