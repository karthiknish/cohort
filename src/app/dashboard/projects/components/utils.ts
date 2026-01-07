import type { ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'
import type { ProjectRecord } from '@/types/projects'
import { FolderKanban, CircleCheck, TriangleAlert } from 'lucide-react'
import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates'
import { calculateBackoffDelay as calculateBackoffDelayLib, sleep } from '@/lib/retry-utils'
import { getErrorMessage as getErrorMessageLib } from '@/lib/error-utils'
import { useDebouncedValue } from '@/hooks/use-debounce'

export type StatusFilter = 'all' | ProjectStatus
export type SortField = 'updatedAt' | 'createdAt' | 'name' | 'status' | 'taskCount'
export type SortDirection = 'asc' | 'desc'
export type ViewMode = 'list' | 'grid' | 'board' | 'gantt'

export const STATUS_FILTERS: StatusFilter[] = ['all', ...PROJECT_STATUSES]

export const STATUS_CLASSES: Record<ProjectStatus, string> = {
  planning: 'bg-slate-100 text-slate-800',
  active: 'bg-emerald-100 text-emerald-800',
  on_hold: 'bg-amber-100 text-amber-800',
  completed: 'bg-muted text-muted-foreground',
}

export const STATUS_ICONS: Record<ProjectStatus, React.ComponentType<{ className?: string }>> = {
  planning: FolderKanban,
  active: CircleCheck,
  on_hold: TriangleAlert,
  completed: CircleCheck,
}

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'createdAt', label: 'Created date' },
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'taskCount', label: 'Task count' },
]

export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
}

export function calculateBackoffDelay(attempt: number): number {
  return calculateBackoffDelayLib(attempt, {
    maxRetries: RETRY_CONFIG.maxRetries,
    baseDelayMs: RETRY_CONFIG.baseDelayMs,
    maxDelayMs: RETRY_CONFIG.maxDelayMs,
    jitterFactor: 0.3,
  })
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true
  }
  if (error instanceof Error && (
    error.message.includes('network') ||
    error.message.includes('Network') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('Connection')
  )) {
    return true
  }
  return false
}

export function formatStatusLabel(status: ProjectStatus | StatusFilter): string {
  if (status === 'all') {
    return 'All statuses'
  }
  return status
    .replace('_', ' ')
    .split(' ')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

export function formatTaskSummary(open: number, total: number): string {
  if (total === 0) {
    return 'Create a task or import from a template'
  }
  if (open === 0) {
    return `${total} tasks • all closed`
  }
  return `${open} of ${total} open`
}

export function formatDate(value: string | null): string {
  return formatDateLib(value, DATE_FORMATS.SHORT, undefined, '—')
}

export function formatDateRange(start: string | null, end: string | null): string {
  const startLabel = formatDate(start)
  const endLabel = formatDate(end)
  if (startLabel === '—' && endLabel === '—') {
    return 'Timeline TBA'
  }
  if (startLabel !== '—' && endLabel === '—') {
    return `Started ${startLabel}`
  }
  if (startLabel === '—' && endLabel !== '—') {
    return `Due ${endLabel}`
  }
  return `${startLabel} – ${endLabel}`
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return getErrorMessageLib(error, fallback)
}

export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
}

export function milestoneStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return '#22c55e'
    case 'in_progress':
      return '#3b82f6'
    case 'blocked':
      return '#f97316'
    case 'planned':
    default:
      return '#6366f1'
  }
}

export function computeTimelineRange(projects: ProjectRecord[], milestones: { startDate?: string | null; endDate?: string | null }[]) {
  const dates: Date[] = []
  projects.forEach((project) => {
    const maybeStart = parseDate(project.startDate)
    const maybeEnd = parseDate(project.endDate)
    if (maybeStart) dates.push(maybeStart)
    if (maybeEnd) dates.push(maybeEnd)
  })
  milestones.forEach((milestone) => {
    const maybeStart = parseDate(milestone.startDate)
    const maybeEnd = parseDate(milestone.endDate)
    if (maybeStart) dates.push(maybeStart)
    if (maybeEnd) dates.push(maybeEnd)
  })

  const today = new Date()
  const start = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : today
  const end = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : addDays(today, 30)

  const paddedStart = addDays(start, -7)
  const paddedEnd = addDays(end, 7)

  if (paddedEnd <= paddedStart) {
    return { start: paddedStart, end: addDays(paddedStart, 30) }
  }

  return { start: paddedStart, end: paddedEnd }
}
