'use client'

import type { TaskRecord } from '@/types/tasks'

export const TASKS_PAGE_SIZE = 50

export type TaskPageCursor = {
  fieldValue: number
  legacyId: string
}

export type PaginatedTasksResult = {
  items: unknown[]
  nextCursor: TaskPageCursor | null
}

export function sortTasksByUpdatedAt(tasks: TaskRecord[]): TaskRecord[] {
  return tasks.toSorted((left, right) => {
    const leftMs = left.updatedAt ? Date.parse(left.updatedAt) : 0
    const rightMs = right.updatedAt ? Date.parse(right.updatedAt) : 0
    return rightMs - leftMs
  })
}

export function mergeTaskPages(firstPage: TaskRecord[], olderPages: TaskRecord[]): TaskRecord[] {
  const byId = new Map<string, TaskRecord>()
  for (const task of firstPage) {
    byId.set(task.id, task)
  }
  for (const task of olderPages) {
    if (!byId.has(task.id)) {
      byId.set(task.id, task)
    }
  }
  return sortTasksByUpdatedAt(Array.from(byId.values()))
}

export function parsePaginatedTasksQuery(value: unknown): PaginatedTasksResult | null {
  if (!value || typeof value !== 'object') return null
  if (!Array.isArray((value as { items?: unknown }).items)) return null

  const nextCursor = (value as { nextCursor?: unknown }).nextCursor
  const parsedCursor =
    nextCursor &&
    typeof nextCursor === 'object' &&
    typeof (nextCursor as TaskPageCursor).fieldValue === 'number' &&
    typeof (nextCursor as TaskPageCursor).legacyId === 'string'
      ? (nextCursor as TaskPageCursor)
      : null

  return {
    items: (value as { items: unknown[] }).items,
    nextCursor: parsedCursor,
  }
}
