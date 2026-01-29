import { Clock, CirclePlay, Eye, CheckCircle2, Circle, Archive } from 'lucide-react'
import { TaskStatus, TaskPriority, TaskRecord, RecurrenceRule } from '@/types/tasks'
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
  archived: 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/50',
}

export const statusLaneColors: Record<TaskStatus, string> = {
  todo: 'bg-slate-500 dark:bg-slate-400',
  'in-progress': 'bg-blue-500 dark:bg-blue-400',
  review: 'bg-amber-500 dark:bg-amber-400',
  completed: 'bg-emerald-500 dark:bg-emerald-400',
  archived: 'bg-gray-500 dark:bg-gray-400',
}

export const priorityColors: Record<TaskPriority, string> = {
  low: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
  medium: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50',
  high: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50',
  urgent: 'text-red-600 bg-red-50 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50',
}

export const STATUS_ICONS: Record<TaskStatus, typeof Circle> = {
  todo: Circle,
  'in-progress': CirclePlay,
  review: Eye,
  completed: CheckCircle2,
  archived: Archive,
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
    case 'archived':
      return 'Archived'
    default:
      return status
  }
}

export function formatPriorityLabel(priority: TaskPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

// Overdue detection
export function isOverdue(task: TaskRecord): boolean {
  if (!task.dueDate || task.status === 'completed' || task.status === 'archived') {
    return false
  }
  const dueDate = new Date(task.dueDate)
  const now = new Date()
  return dueDate < now
}

export function isDueSoon(task: TaskRecord, daysThreshold: number = 3): boolean {
  if (!task.dueDate || task.status === 'completed' || task.status === 'archived') {
    return false
  }
  const dueDate = new Date(task.dueDate)
  const now = new Date()
  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= daysThreshold
}

// Overdue indicator styles
export function getOverdueIndicatorClass(task: TaskRecord): string {
  if (isOverdue(task)) {
    return 'bg-red-500/10 border-red-500/30'
  }
  if (isDueSoon(task)) {
    return 'bg-amber-500/10 border-amber-500/30'
  }
  return ''
}

// Recurrence rule labels
export function formatRecurrenceLabel(rule: RecurrenceRule): string {
  const labels: Record<RecurrenceRule, string> = {
    none: 'Does not repeat',
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Every 2 weeks',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
  }
  return labels[rule] || rule
}

// Format time spent
export function formatTimeSpent(minutes: number | null | undefined): string {
  if (!minutes || minutes === 0) return 'No time logged'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  return `${mins}m`
}

// Calculate task completion percentage based on subtasks
export function getTaskCompletion(task: TaskRecord): number {
  if (!task.subtaskCount || task.subtaskCount === 0) {
    return task.status === 'completed' ? 100 : 0
  }
  // This would need actual subtask data - placeholder for now
  return task.status === 'completed' ? 100 : 0
}

// Generate share URL for a task
export function getTaskShareUrl(taskId: string): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/dashboard/tasks?taskId=${taskId}`
}

// Default task templates
export const DEFAULT_TASK_TEMPLATES = [
  {
    id: 'template-1',
    name: 'Bug Report',
    description: 'Report and track software bugs',
    title: '[BUG] {Issue description}',
    descriptionTemplate: 'Steps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\nActual behavior:\n\nEnvironment:',
    status: 'todo' as TaskStatus,
    priority: 'high' as TaskPriority,
    tags: ['bug', 'urgent'],
    estimatedHours: 2,
  },
  {
    id: 'template-2',
    name: 'Feature Request',
    description: 'Propose a new feature',
    title: '[FEATURE] {Feature name}',
    descriptionTemplate: 'Problem statement:\n\nProposed solution:\n\nBenefits:\n\nAlternatives considered:',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    tags: ['feature', 'enhancement'],
    estimatedHours: 4,
  },
  {
    id: 'template-3',
    name: 'Client Review',
    description: 'Prepare and conduct client review meeting',
    title: 'Client Review: {Client/Project}',
    descriptionTemplate: 'Agenda:\n1. Performance review\n2. Upcoming deliverables\n3. Feedback discussion\n\nPreparation:\n- Gather metrics\n- Prepare presentation\n- Schedule meeting',
    status: 'review' as TaskStatus,
    priority: 'medium' as TaskPriority,
    tags: ['client', 'review', 'meeting'],
    estimatedHours: 3,
  },
  {
    id: 'template-4',
    name: 'Content Creation',
    description: 'Create content for marketing',
    title: '{Content type} for {Campaign}',
    descriptionTemplate: 'Content brief:\n- Target audience:\n- Key message:\n- Call to action:\n- Channels:\n- Due date:\n\nAssets needed:',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    tags: ['content', 'marketing'],
    estimatedHours: 2,
  },
  {
    id: 'template-5',
    name: 'Sprint Planning',
    description: 'Plan upcoming sprint',
    title: 'Sprint Planning - {Sprint number}',
    descriptionTemplate: 'Sprint goals:\n\nTeam capacity:\n\nStories to include:\n\nRisks and dependencies:',
    status: 'todo' as TaskStatus,
    priority: 'high' as TaskPriority,
    tags: ['planning', 'sprint', 'agile'],
    estimatedHours: 1,
  },
]

// Priority order for sorting (extended)
export const STATUS_ORDER: Record<TaskStatus, number> = {
  'in-progress': 0,
  review: 1,
  todo: 2,
  completed: 3,
  archived: 4,
}

// Get next status in workflow
export function getNextStatus(currentStatus: TaskStatus): TaskStatus | null {
  const workflow: Record<TaskStatus, TaskStatus | null> = {
    todo: 'in-progress',
    'in-progress': 'review',
    review: 'completed',
    completed: null,
    archived: null,
  }
  return workflow[currentStatus]
}

// Get previous status in workflow
export function getPreviousStatus(currentStatus: TaskStatus): TaskStatus | null {
  const reverseWorkflow: Record<TaskStatus, TaskStatus | null> = {
    'in-progress': 'todo',
    review: 'in-progress',
    completed: 'review',
    todo: null,
    archived: null,
  }
  return reverseWorkflow[currentStatus]
}
