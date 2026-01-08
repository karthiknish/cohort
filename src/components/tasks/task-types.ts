import { Clock, ListTodo, CirclePlay, Eye, CircleCheck, AlertCircle, AlertTriangle, CheckCircle2, Circle } from 'lucide-react'
import { TaskStatus, TaskPriority, TaskRecord } from '@/types/tasks'
import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates'
import { calculateBackoffDelay as calculateBackoffDelayLib, sleep as sleepLib } from '@/lib/retry-utils'

// Retry configuration for network resilience
export const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
} as const

export type SortField = 'updatedAt' | 'createdAt' | 'title' | 'status' | 'priority' | 'dueDate'
export type SortDirection = 'asc' | 'desc'

export const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'updatedAt', label: 'Last updated' },
  { value: 'createdAt', label: 'Created date' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'dueDate', label: 'Due date' },
]

export const statusColors: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800',
  'in-progress': 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50',
  review: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50',
}

export const statusLaneColors: Record<TaskStatus, string> = {
  todo: '#64748b', // slate-500
  'in-progress': '#3b82f6', // blue-500
  review: '#f59e0b', // amber-500
  completed: '#10b981', // emerald-500
}

export const priorityColors: Record<TaskPriority, string> = {
  low: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
  medium: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50',
  high: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50',
  urgent: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
}

export const STATUS_ICONS: Record<TaskStatus, any> = {
  todo: Circle,
  'in-progress': CirclePlay,
  review: Eye,
  completed: CheckCircle2,
}

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export type TaskFormState = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo: string
  clientId: string | null
  clientName: string
  dueDate: string
  tags: string
}

export type TaskListResponse = {
  tasks?: TaskRecord[]
  nextCursor?: string | null
}

export type ProjectFilter = {
  id: string | null
  name: string | null
}

export type SummaryCardConfig = {
  status: TaskStatus
  label: string
  icon: typeof Clock
  iconClass: string
}

export const buildInitialFormState = (client?: { id: string | null; name: string | null }): TaskFormState => ({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignedTo: '',
  clientId: client?.id ?? null,
  clientName: client?.name ?? '',
  dueDate: '',
  tags: '',
})

// Utility functions
export const sleep = sleepLib

export function calculateBackoffDelay(attempt: number): number {
  return calculateBackoffDelayLib(attempt, {
    maxRetries: RETRY_CONFIG.maxRetries,
    baseDelayMs: RETRY_CONFIG.baseDelayMs,
    maxDelayMs: RETRY_CONFIG.maxDelayMs,
    jitterFactor: 0.3,
  })
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) return true
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    return msg.includes('network') || msg.includes('timeout') || msg.includes('aborted')
  }
  return false
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return 'No due date'

  const date = new Date(value)
  if (isNaN(date.getTime())) return value

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 1 && diffDays < 7) {
    return formatDateLib(value, 'EEEE')
  }

  const formatted = formatDateLib(value, DATE_FORMATS.SHORT, undefined, '')
  return formatted || value
}

export function formatStatusLabel(status: TaskStatus): string {
  switch (status) {
    case 'in-progress':
      return 'In Progress'
    case 'todo':
      return 'To Do'
    case 'review':
      return 'Review'
    case 'completed':
      return 'Completed'
    default:
      return status
  }
}

export function formatPriorityLabel(priority: TaskPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}
