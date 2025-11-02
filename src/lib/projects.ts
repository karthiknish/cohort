import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'

export const projectStatusSchema = z.enum(PROJECT_STATUSES)

export type StoredProject = {
  name?: unknown
  description?: unknown
  status?: unknown
  clientId?: unknown
  clientName?: unknown
  startDate?: unknown
  endDate?: unknown
  tags?: unknown
  ownerId?: unknown
  createdAt?: unknown
  updatedAt?: unknown
}

export function toISO(value: unknown): string | null {
  if (!value && value !== 0) {
    return null
  }
  if (value instanceof Timestamp) {
    return value.toDate().toISOString()
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: () => Date }).toDate === 'function'
  ) {
    const date = (value as { toDate: () => Date }).toDate()
    return date instanceof Date ? date.toISOString() : null
  }
  if (typeof value === 'string') {
    const parsed = new Date(value)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString()
    }
    return value
  }
  return null
}

export function coerceStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0)
}

export function mapProjectDoc(docId: string, data: StoredProject): ProjectRecord {
  const status = (typeof data.status === 'string' ? data.status : 'planning') as ProjectStatus
  const normalizedStatus = PROJECT_STATUSES.includes(status) ? status : 'planning'

  return {
    id: docId,
    name: typeof data.name === 'string' ? data.name : 'Untitled project',
    description: typeof data.description === 'string' ? data.description : null,
    status: normalizedStatus,
    clientId: typeof data.clientId === 'string' ? data.clientId : null,
    clientName: typeof data.clientName === 'string' ? data.clientName : null,
    startDate: toISO(data.startDate),
    endDate: toISO(data.endDate),
    tags: coerceStringArray(data.tags),
    ownerId: typeof data.ownerId === 'string' ? data.ownerId : null,
    createdAt: toISO(data.createdAt),
    updatedAt: toISO(data.updatedAt),
    taskCount: 0,
    openTaskCount: 0,
    recentActivityAt: toISO(data.updatedAt),
  }
}
