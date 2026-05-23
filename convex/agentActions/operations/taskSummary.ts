import {
  formatTaskDate,
  formatTaskPriorityLabel,
  formatTaskStatusLabel,
  isCompletedTaskStatus,
  type ClientTaskRecord,
} from './shared'

const DAY_MS = 24 * 60 * 60 * 1000
const DUE_SOON_DAYS = 3

export type TaskTimeWindow = 'all' | 'due_this_week' | 'due_soon' | 'overdue' | 'today'

export type ListedTask = {
  taskId: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  dueLabel: string | null
  assignedTo: string[]
  clientName: string | null
  projectName: string | null
}

export type TaskDigest = {
  mode: 'summary' | 'list'
  timeWindow: TaskTimeWindow
  timeWindowLabel: string
  scopeLabel: string
  clientId?: string
  clientName?: string
  totalTasks: number
  openTasks: number
  completedTasks: number
  overdueTasks: number
  dueSoonTasks: number
  dueThisWeekTasks: number
  highPriorityTasks: number
  unscheduledOpen: number
  statusBreakdown: Array<{ status: string; count: number }>
  focusTasks: ListedTask[]
  overdueTaskList: ListedTask[]
  dueThisWeekList: ListedTask[]
  dueSoonList: ListedTask[]
  highPriorityList: ListedTask[]
  tasks: ListedTask[]
}

function normalizeIntentText(message: string): string {
  return message.toLowerCase().replace(/\s+/g, ' ').trim()
}

function includesAnyPhrase(input: string, phrases: string[]): boolean {
  return phrases.some((phrase) => input.includes(phrase))
}

export function parseTaskTimeWindowFromIntent(message: string): TaskTimeWindow {
  const normalized = normalizeIntentText(message)

  if (includesAnyPhrase(normalized, ['due this week', 'this week', 'within the week'])) {
    return 'due_this_week'
  }
  if (includesAnyPhrase(normalized, ['overdue', 'past due', 'late task', 'late tasks'])) {
    return 'overdue'
  }
  if (includesAnyPhrase(normalized, ['due today', 'today only', 'for today'])) {
    return 'today'
  }
  if (includesAnyPhrase(normalized, ['due soon', 'coming up', 'next few days', 'due shortly'])) {
    return 'due_soon'
  }

  return 'all'
}

export function taskTimeWindowLabel(window: TaskTimeWindow): string {
  switch (window) {
    case 'due_this_week':
      return 'Due this week'
    case 'due_soon':
      return `Due in the next ${DUE_SOON_DAYS} days`
    case 'overdue':
      return 'Overdue'
    case 'today':
      return 'Due today'
    default:
      return 'All open tasks'
  }
}

function endOfWeekMs(nowMs: number): number {
  const date = new Date(nowMs)
  const day = date.getDay()
  const daysUntilSunday = day === 0 ? 0 : 7 - day
  const end = new Date(date)
  end.setDate(end.getDate() + daysUntilSunday)
  end.setHours(23, 59, 59, 999)
  return end.getTime()
}

function startOfDayMs(nowMs: number): number {
  const date = new Date(nowMs)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

function endOfDayMs(nowMs: number): number {
  const date = new Date(nowMs)
  date.setHours(23, 59, 59, 999)
  return date.getTime()
}

export function formatDueLabel(dueDateMs: number | null, nowMs: number): string | null {
  if (dueDateMs === null || !Number.isFinite(dueDateMs)) return null

  const diffMs = dueDateMs - nowMs
  const diffDays = Math.floor(diffMs / DAY_MS)

  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays)
    return overdueDays === 0 ? 'Overdue today' : `${overdueDays}d overdue`
  }
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays <= 7) return `Due in ${diffDays}d`
  return formatTaskDate(dueDateMs)
}

function isHighPriority(priority: string): boolean {
  const normalized = priority.toLowerCase()
  return normalized === 'high' || normalized === 'urgent'
}

function sortByDueThenPriority(left: ClientTaskRecord, right: ClientTaskRecord): number {
  const leftDue = left.dueDateMs ?? Number.MAX_SAFE_INTEGER
  const rightDue = right.dueDateMs ?? Number.MAX_SAFE_INTEGER
  if (leftDue !== rightDue) return leftDue - rightDue

  const leftPriority = isHighPriority(left.priority) ? 0 : 1
  const rightPriority = isHighPriority(right.priority) ? 0 : 1
  return leftPriority - rightPriority
}

function matchesTimeWindow(task: ClientTaskRecord, window: TaskTimeWindow, nowMs: number): boolean {
  if (isCompletedTaskStatus(task.status)) return false

  const dueMs = task.dueDateMs
  if (window === 'all') return true

  if (dueMs === null || !Number.isFinite(dueMs)) return false

  const weekEnd = endOfWeekMs(nowMs)

  switch (window) {
    case 'overdue':
      return dueMs < startOfDayMs(nowMs)
    case 'today':
      return dueMs >= startOfDayMs(nowMs) && dueMs <= endOfDayMs(nowMs)
    case 'due_soon':
      return dueMs >= startOfDayMs(nowMs) && dueMs <= nowMs + DUE_SOON_DAYS * DAY_MS
    case 'due_this_week':
      return dueMs >= startOfDayMs(nowMs) && dueMs <= weekEnd
    default:
      return true
  }
}

export function toListedTask(task: ClientTaskRecord, nowMs: number): ListedTask {
  return {
    taskId: task.legacyId,
    title: task.title,
    status: formatTaskStatusLabel(task.status),
    priority: formatTaskPriorityLabel(task.priority),
    dueDate: formatTaskDate(task.dueDateMs),
    dueLabel: formatDueLabel(task.dueDateMs, nowMs),
    assignedTo: task.assignedTo ?? [],
    clientName: task.clientName ?? null,
    projectName: task.projectName ?? null,
  }
}

function formatTaskLine(task: ListedTask, options?: { includeClient?: boolean }): string {
  const parts = [
    task.dueLabel ?? (task.dueDate ? `Due ${task.dueDate}` : 'No due date'),
    task.priority,
    task.status,
  ]
  if (options?.includeClient && task.clientName) {
    parts.push(task.clientName)
  }
  if (task.projectName) {
    parts.push(task.projectName)
  }
  if (task.assignedTo.length > 0) {
    parts.push(task.assignedTo.join(', '))
  }
  return `“${task.title}” (${parts.join(' · ')})`
}

export function buildTaskDigest(args: {
  tasks: ClientTaskRecord[]
  mode: 'summary' | 'list'
  timeWindow: TaskTimeWindow
  scopeLabel: string
  clientId?: string
  clientName?: string
  nowMs?: number
}): TaskDigest {
  const nowMs = args.nowMs ?? Date.now()
  const dueSoonCutoffMs = nowMs + DUE_SOON_DAYS * DAY_MS
  const weekEndMs = endOfWeekMs(nowMs)

  const openTasks = args.tasks.filter((task) => !isCompletedTaskStatus(task.status))
  const completedTasks = args.tasks.length - openTasks.length
  const overdueOpen = openTasks.filter(
    (task) => typeof task.dueDateMs === 'number' && task.dueDateMs < startOfDayMs(nowMs),
  )
  const dueSoonOpen = openTasks.filter(
    (task) =>
      typeof task.dueDateMs === 'number' &&
      task.dueDateMs >= startOfDayMs(nowMs) &&
      task.dueDateMs <= dueSoonCutoffMs,
  )
  const dueThisWeekOpen = openTasks.filter(
    (task) =>
      typeof task.dueDateMs === 'number' &&
      task.dueDateMs >= startOfDayMs(nowMs) &&
      task.dueDateMs <= weekEndMs,
  )
  const highPriorityOpen = openTasks.filter((task) => isHighPriority(task.priority))
  const unscheduledOpen = openTasks.filter((task) => task.dueDateMs === null)

  const statusBreakdown = Array.from(
    args.tasks.reduce<Map<string, number>>((acc, task) => {
      const status = task.status.trim().toLowerCase() || 'unknown'
      acc.set(status, (acc.get(status) ?? 0) + 1)
      return acc
    }, new Map()),
  )
    .map(([status, count]) => ({ status, count }))
    .sort((left, right) => right.count - left.count)

  const focusSource = openTasks
    .filter((task) => matchesTimeWindow(task, args.timeWindow, nowMs))
    .sort(sortByDueThenPriority)

  const focusTasks = focusSource.slice(0, 8).map((task) => toListedTask(task, nowMs))
  const overdueTaskList = overdueOpen.slice(0, 5).map((task) => toListedTask(task, nowMs))
  const dueThisWeekList = dueThisWeekOpen.slice(0, 8).map((task) => toListedTask(task, nowMs))
  const dueSoonList = dueSoonOpen.slice(0, 8).map((task) => toListedTask(task, nowMs))
  const highPriorityList = highPriorityOpen.slice(0, 5).map((task) => toListedTask(task, nowMs))
  const tasks = openTasks
    .sort(sortByDueThenPriority)
    .slice(0, 10)
    .map((task) => toListedTask(task, nowMs))

  return {
    mode: args.mode,
    timeWindow: args.timeWindow,
    timeWindowLabel: taskTimeWindowLabel(args.timeWindow),
    scopeLabel: args.scopeLabel,
    clientId: args.clientId,
    clientName: args.clientName,
    totalTasks: args.tasks.length,
    openTasks: openTasks.length,
    completedTasks,
    overdueTasks: overdueOpen.length,
    dueSoonTasks: dueSoonOpen.length,
    dueThisWeekTasks: dueThisWeekOpen.length,
    highPriorityTasks: highPriorityOpen.length,
    unscheduledOpen: unscheduledOpen.length,
    statusBreakdown,
    focusTasks,
    overdueTaskList,
    dueThisWeekList,
    dueSoonList,
    highPriorityList,
    tasks,
  }
}

export function buildTaskDigestUserMessage(digest: TaskDigest): string {
  const scope = digest.clientName ?? digest.scopeLabel
  const includeClient = !digest.clientName

  if (digest.totalTasks === 0) {
    return digest.clientName
      ? `I couldn’t find any tasks for ${digest.clientName}.`
      : 'You have no tasks assigned to you (or unassigned) in this workspace right now.'
  }

  if (digest.mode === 'list') {
    const listed = digest.tasks.slice(0, 5)
    if (listed.length === 0) {
      return `No open tasks to list for ${scope}.`
    }
    const lines = listed.map((task, index) => `${index + 1}. ${formatTaskLine(task, { includeClient })}`)
    return `Here are ${digest.openTasks} open task${digest.openTasks === 1 ? '' : 's'} for ${scope}:\n${lines.join('\n')}`
  }

  const window = digest.timeWindow
  const focusCount = digest.focusTasks.length
  const matchedInWindow =
    window === 'overdue'
      ? digest.overdueTasks
      : window === 'due_this_week'
        ? digest.dueThisWeekTasks
        : window === 'due_soon'
          ? digest.dueSoonTasks
          : window === 'today'
            ? digest.focusTasks.length
            : digest.openTasks

  const headlineParts: string[] = []
  if (window === 'all') {
    headlineParts.push(`${digest.openTasks} open`, `${digest.completedTasks} completed`)
    if (digest.overdueTasks > 0) {
      headlineParts.push(`${digest.overdueTasks} overdue`)
    }
  } else if (matchedInWindow === 0) {
    headlineParts.push(
      `none ${window === 'due_this_week' ? 'due this week' : digest.timeWindowLabel.toLowerCase()}`,
      `${digest.openTasks} open overall`,
    )
  } else {
    headlineParts.push(
      `${matchedInWindow} ${digest.timeWindowLabel.toLowerCase()}`,
      `${digest.openTasks} open overall`,
    )
  }

  const headline = `For ${scope}: ${headlineParts.filter(Boolean).join(', ')}.`
  const detailLines: string[] = []

  if (window !== 'all' && focusCount > 0) {
    detailLines.push(
      ...digest.focusTasks.slice(0, 5).map((task, index) => `${index + 1}. ${formatTaskLine(task, { includeClient })}`),
    )
  } else if (window === 'all') {
    if (digest.overdueTasks > 0) {
      detailLines.push(
        `Overdue: ${digest.overdueTaskList
          .slice(0, 3)
          .map((task) => formatTaskLine(task, { includeClient }))
          .join('; ')}`,
      )
    }
    if (digest.dueThisWeekTasks > 0) {
      detailLines.push(
        `Due this week: ${digest.dueThisWeekList
          .slice(0, 3)
          .map((task) => formatTaskLine(task, { includeClient }))
          .join('; ')}`,
      )
    } else if (digest.dueSoonTasks > 0) {
      detailLines.push(
        `Due soon: ${digest.dueSoonList
          .slice(0, 3)
          .map((task) => formatTaskLine(task, { includeClient }))
          .join('; ')}`,
      )
    }
  }

  if (window === 'due_this_week' && matchedInWindow === 0) {
    const hints: string[] = []
    if (digest.overdueTasks > 0) {
      hints.push(`${digest.overdueTasks} overdue`)
    }
    if (digest.dueSoonTasks > 0) {
      hints.push(`${digest.dueSoonTasks} due in the next ${DUE_SOON_DAYS} days`)
    }
    if (digest.unscheduledOpen > 0) {
      hints.push(`${digest.unscheduledOpen} without a due date`)
    }
    if (hints.length > 0) {
      detailLines.push(`Elsewhere: ${hints.join(', ')}.`)
    }
  }

  if (digest.highPriorityTasks > 0 && window !== 'all') {
    const urgent = digest.highPriorityList
      .slice(0, 2)
      .map((task) => task.title)
      .join(', ')
    if (urgent) {
      detailLines.push(`High priority: ${urgent}.`)
    }
  }

  if (detailLines.length === 0 && digest.openTasks > 0 && digest.unscheduledOpen === digest.openTasks) {
    detailLines.push('None of your open tasks have due dates yet — add dates so weekly planning is easier.')
  }

  return detailLines.length > 0 ? `${headline}\n${detailLines.join('\n')}` : headline
}
