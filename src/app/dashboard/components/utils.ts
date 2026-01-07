import type { TaskRecord } from '@/types/tasks'
import type { SummaryStat } from '@/types/dashboard'

const DAY_IN_MS = 24 * 60 * 60 * 1000

export type TaskSummary = {
  total: number
  overdue: number
  dueSoon: number
  highPriority: number
}

export const DEFAULT_TASK_SUMMARY: TaskSummary = {
  total: 0,
  overdue: 0,
  dueSoon: 0,
  highPriority: 0,
}

export const ROLE_PRIORITY: Record<'admin' | 'team' | 'client' | 'default', string[]> = {
  admin: ['net-margin', 'outstanding', 'roas', 'total-revenue', 'overdue-invoices', 'ad-spend', 'open-tasks', 'conversions'],
  team: ['due-soon', 'high-priority-tasks', 'open-tasks', 'ad-spend', 'roas', 'conversions', 'net-margin', 'total-revenue'],
  client: ['ad-spend', 'outstanding', 'next-due', 'roas', 'open-tasks', 'due-soon', 'net-margin', 'total-revenue'],
  default: ['total-revenue', 'net-margin', 'roas', 'ad-spend', 'open-tasks', 'conversions', 'outstanding', 'due-soon'],
}

export function summarizeTasks(tasks: TaskRecord[]): TaskSummary {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return DEFAULT_TASK_SUMMARY
  }

  const now = Date.now()
  const soonCutoff = now + 3 * DAY_IN_MS

  let overdue = 0
  let dueSoon = 0
  let highPriority = 0

  tasks.forEach((task) => {
    if (task.priority === 'high' || task.priority === 'urgent') {
      highPriority += 1
    }

    const dueTimestamp = task.dueDate ? Date.parse(task.dueDate) : Number.NaN
    if (Number.isNaN(dueTimestamp)) {
      return
    }
    if (dueTimestamp < now) {
      overdue += 1
      return
    }
    if (dueTimestamp <= soonCutoff) {
      dueSoon += 1
    }
  })

  return {
    total: tasks.length,
    overdue,
    dueSoon,
    highPriority,
  }
}

export function sumOutstanding(totals: { totalOutstanding: number }[]): number {
  if (!Array.isArray(totals) || totals.length === 0) {
    return 0
  }
  return totals.reduce((sum, entry) => sum + (Number.isFinite(entry.totalOutstanding) ? entry.totalOutstanding : 0), 0)
}

export function formatNextDueLabel(nextDueAt: string | null | undefined): string | null {
  if (!nextDueAt) {
    return null
  }

  const target = new Date(nextDueAt)
  if (Number.isNaN(target.getTime())) {
    return null
  }

  const todayStart = startOfDay(new Date())
  const targetStart = startOfDay(target)
  const diffDays = Math.round((targetStart.getTime() - todayStart.getTime()) / DAY_IN_MS)

  if (diffDays === 0) {
    return 'Due today'
  }
  if (diffDays === 1) {
    return 'Due tomorrow'
  }
  if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays)
    return `${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`
  }
  return `Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`
}

export function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

export function selectTopStatsByRole(stats: SummaryStat[], role?: string | null): { primary: SummaryStat[]; secondary: SummaryStat[] } {
  if (!Array.isArray(stats) || stats.length === 0) {
    return { primary: [], secondary: [] }
  }

  const key = role === 'admin' || role === 'team' || role === 'client' ? role : 'default'
  const priorityOrder = ROLE_PRIORITY[key]

  const statMap = new Map(stats.map((stat) => [stat.id, stat]))
  const ordered: SummaryStat[] = []

  priorityOrder.forEach((id) => {
    const item = statMap.get(id)
    if (item && !ordered.some((stat) => stat.id === item.id)) {
      ordered.push(item)
    }
  })

  stats.forEach((stat) => {
    if (!ordered.some((item) => item.id === stat.id)) {
      ordered.push(stat)
    }
  })

  const primary = ordered.slice(0, 4)
  const secondary = ordered.slice(4)

  return { primary, secondary }
}
