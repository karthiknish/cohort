import { Clock, ListTodo, PlayCircle, Eye, CheckCircle2 } from 'lucide-react'
import { TaskStatus, TaskPriority, TaskRecord } from '@/types/tasks'

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
  todo: 'bg-muted text-muted-foreground dark:bg-muted/60',
  'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  review: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
}

export const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
}

export const STATUS_ICONS: Record<TaskStatus, typeof Clock> = {
  todo: ListTodo,
  'in-progress': PlayCircle,
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
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function calculateBackoffDelay(attempt: number): number {
  const delay = RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt)
  const jitter = Math.random() * 0.3 * delay
  return Math.min(delay + jitter, RETRY_CONFIG.maxDelayMs)
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
  if (!value) {
    return 'No due date'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
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
