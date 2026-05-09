import { Archive, CheckCircle2, Circle, CirclePlay, Eye, type LucideIcon } from 'lucide-react'

import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates'
import { calculateBackoffDelay as calculateBackoffDelayLib, sleep as sleepLib } from '@/lib/retry-utils'
import type { RecurrenceRule, TaskPriority, TaskRecord, TaskStatus } from '@/types/tasks'

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
  todo: 'border-border bg-muted text-muted-foreground shadow-sm',
  'in-progress': 'border-transparent bg-primary/10 text-primary shadow-sm',
  review: 'border-transparent bg-accent text-accent-foreground shadow-sm',
  completed: 'border-transparent bg-primary/10 text-primary shadow-sm',
  archived: 'border-border bg-background text-muted-foreground shadow-sm',
}

export const statusLaneColors: Record<TaskStatus, string> = {
  todo: 'bg-muted-foreground',
  'in-progress': 'bg-primary',
  review: 'bg-accent-foreground',
  completed: 'bg-primary',
  archived: 'bg-muted-foreground/60',
}

export const priorityColors: Record<TaskPriority, string> = {
  low: 'border-transparent bg-secondary text-secondary-foreground shadow-sm',
  medium: 'border-transparent bg-primary/10 text-primary shadow-sm',
  high: 'border-transparent bg-accent text-accent-foreground shadow-sm',
  urgent: 'border-transparent bg-destructive/10 text-destructive shadow-sm',
}

export const taskPillColors = {
  count: 'border-border bg-background text-foreground shadow-sm',
  client: 'border-border bg-muted text-muted-foreground shadow-sm',
  project: 'border-transparent bg-primary/10 text-primary shadow-sm',
  neutral: 'border-border bg-muted text-muted-foreground shadow-sm',
  subtask: 'border-transparent bg-secondary text-secondary-foreground shadow-sm',
  comments: 'border-transparent bg-accent text-accent-foreground shadow-sm',
  attachments: 'border-border bg-background text-muted-foreground shadow-sm',
  time: 'border-transparent bg-primary/10 text-primary shadow-sm',
  recurring: 'border-transparent bg-secondary text-secondary-foreground shadow-sm',
  shared: 'border-transparent bg-primary/10 text-primary shadow-sm',
  tag: 'border-border bg-background text-muted-foreground shadow-sm',
  dueSoon: 'border-transparent bg-accent text-accent-foreground shadow-sm',
  overdue: 'border-transparent bg-destructive/10 text-destructive shadow-sm',
} as const

export const taskInfoPanelClasses = {
  base: 'rounded-[1.15rem] border border-border bg-background px-3.5 py-3 shadow-sm',
  icon: 'flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground shadow-sm',
  label: 'text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground',
  value: 'text-sm font-semibold leading-tight text-foreground',
} as const

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
  projectId: string | null
  projectName: string
  dueDate: string
}

export type TaskListResponse = {
  tasks?: TaskRecord[]
  nextCursor?: string | null
}

export type TaskParticipant = {
  id?: string
  name: string
  role?: string
  email?: string
}

export type ProjectFilter = {
  id: string | null
  name: string | null
}

export type SummaryCardConfig = {
  status: TaskStatus
  label: string
  icon: LucideIcon
  iconClass: string
}

export const buildInitialFormState = (
  client?: { id: string | null; name: string | null },
  project?: { id: string | null; name: string | null },
): TaskFormState => ({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignedTo: '',
  clientId: client?.id ?? null,
  clientName: client?.name ?? '',
  projectId: project?.id ?? null,
  projectName: project?.name ?? '',
  dueDate: '',
})

function parseTaskDateValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2]) - 1
    const day = Number(match[3])
    const date = new Date(year, month, day)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function isFutureTaskDueDate(date: Date, now: Date = new Date()): boolean {
  return startOfLocalDay(date).getTime() >= startOfLocalDay(now).getTime()
}

export function isTaskDueDateDisabled(date: Date): boolean {
  return !isFutureTaskDueDate(date)
}

export function isFutureTaskDueDateValue(value: string | null | undefined, now: Date = new Date()): boolean {
  if (!value) return true

  const date = parseTaskDateValue(value)
  if (!date) return false

  return isFutureTaskDueDate(date, now)
}

// Convert ClientTeamMember[] to MentionableUser[] for MentionInput
export function teamMembersToMentionable(
  members: TaskParticipant[]
): Array<{ id: string; name: string; role?: string }> {
  return members.map((m, idx) => ({
    id: m.id ?? `member-${idx}`,
    name: m.name,
    role: m.role,
  }))
}

export function mergeTaskParticipants(sources: TaskParticipant[][]): TaskParticipant[] {
  const byName = new Map<string, TaskParticipant>()

  for (const members of sources) {
    for (const member of members) {
      const key = member.name.trim().toLowerCase()
      if (!key) continue

      const existing = byName.get(key)
      byName.set(key, {
        id: member.id ?? existing?.id,
        name: member.name,
        role: existing?.role ?? member.role,
        email: member.email ?? existing?.email,
      })
    }
  }

  return Array.from(byName.values()).toSorted((a, b) => a.name.localeCompare(b.name))
}

/**
 * Extract plain user names from a MentionInput value string.
 * Handles both `@[Name]` mention format and plain comma-separated names.
 */
export function parseMentionNames(value: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]/g
  const names: string[] = []
  let match = mentionRegex.exec(value)

  while (match !== null) {
    const name = match[1]?.trim()
    if (name) names.push(name)
    match = mentionRegex.exec(value)
  }

  // If no @[...] mentions found, fall back to comma-separated parsing
  if (names.length === 0) {
    return value
      .split(',')
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
  }

  return names
}


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
  if (Number.isNaN(date.getTime())) return value

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
    return 'bg-destructive/10 border-destructive/30'
  }
  if (isDueSoon(task)) {
    return 'bg-accent/10 border-accent/30'
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
