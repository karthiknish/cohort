import { MILESTONE_STATUSES, type MilestoneRecord } from '@/types/milestones'
import { PROJECT_STATUSES, type ProjectRecord, type ProjectStatus } from '@/types/projects'

function isProjectStatus(value: unknown): value is ProjectStatus {
  return typeof value === 'string' && PROJECT_STATUSES.includes(value as ProjectStatus)
}

function isMilestoneStatus(value: unknown): value is MilestoneRecord['status'] {
  return typeof value === 'string' && MILESTONE_STATUSES.includes(value as MilestoneRecord['status'])
}

export function mapProjectRecord(row: unknown): ProjectRecord {
  const record = row && typeof row === 'object' ? (row as Record<string, unknown>) : null
  const status = isProjectStatus(record?.status) ? record.status : 'planning'
  const tags = Array.isArray(record?.tags)
    ? record.tags.filter((tag): tag is string => typeof tag === 'string')
    : []

  return {
    id: String(record?.legacyId ?? ''),
    name: String(record?.name ?? ''),
    description: typeof record?.description === 'string' ? record.description : null,
    status,
    clientId: typeof record?.clientId === 'string' ? record.clientId : null,
    clientName: typeof record?.clientName === 'string' ? record.clientName : null,
    startDate: typeof record?.startDateMs === 'number' ? new Date(record.startDateMs).toISOString() : null,
    endDate: typeof record?.endDateMs === 'number' ? new Date(record.endDateMs).toISOString() : null,
    tags,
    ownerId: typeof record?.ownerId === 'string' ? record.ownerId : null,
    createdAt: typeof record?.createdAtMs === 'number' ? new Date(record.createdAtMs).toISOString() : null,
    updatedAt: typeof record?.updatedAtMs === 'number' ? new Date(record.updatedAtMs).toISOString() : null,
    taskCount: 0,
    openTaskCount: 0,
    recentActivityAt: null,
    deletedAt: typeof record?.deletedAtMs === 'number' ? new Date(record.deletedAtMs).toISOString() : null,
  }
}

export function mapMilestoneRecord(row: unknown): MilestoneRecord {
  const record = row && typeof row === 'object' ? (row as Record<string, unknown>) : null

  return {
    id: String(record?.legacyId ?? ''),
    projectId: String(record?.projectId ?? ''),
    title: String(record?.title ?? ''),
    description: typeof record?.description === 'string' ? record.description : null,
    status: isMilestoneStatus(record?.status) ? record.status : 'planned',
    startDate: typeof record?.startDateMs === 'number' ? new Date(record.startDateMs).toISOString() : null,
    endDate: typeof record?.endDateMs === 'number' ? new Date(record.endDateMs).toISOString() : null,
    ownerId: typeof record?.ownerId === 'string' ? record.ownerId : null,
    order: typeof record?.order === 'number' ? record.order : null,
    createdAt: typeof record?.createdAtMs === 'number' ? new Date(record.createdAtMs).toISOString() : null,
    updatedAt: typeof record?.updatedAtMs === 'number' ? new Date(record.updatedAtMs).toISOString() : null,
  }
}
