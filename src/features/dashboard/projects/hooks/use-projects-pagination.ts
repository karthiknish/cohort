'use client'

import type { ProjectRecord } from '@/types/projects'

export const PROJECTS_PAGE_SIZE = 50

export type ProjectPageCursor = {
  fieldValue: number
  legacyId: string
}

export type PaginatedProjectsResult = {
  items: unknown[]
  nextCursor: ProjectPageCursor | null
}

export function sortProjectsByUpdatedAt(projects: ProjectRecord[]): ProjectRecord[] {
  return projects.toSorted((left, right) => {
    const leftMs = left.updatedAt ? Date.parse(left.updatedAt) : 0
    const rightMs = right.updatedAt ? Date.parse(right.updatedAt) : 0
    return rightMs - leftMs
  })
}

export function mergeProjectPages(firstPage: ProjectRecord[], olderPages: ProjectRecord[]): ProjectRecord[] {
  const byId = new Map<string, ProjectRecord>()
  for (const project of firstPage) {
    byId.set(project.id, project)
  }
  for (const project of olderPages) {
    if (!byId.has(project.id)) {
      byId.set(project.id, project)
    }
  }
  return sortProjectsByUpdatedAt(Array.from(byId.values()))
}

export function parsePaginatedProjectsQuery(value: unknown): PaginatedProjectsResult | null {
  if (!value || typeof value !== 'object') return null
  if (!Array.isArray((value as { items?: unknown }).items)) return null

  const nextCursor = (value as { nextCursor?: unknown }).nextCursor
  const parsedCursor =
    nextCursor &&
    typeof nextCursor === 'object' &&
    typeof (nextCursor as ProjectPageCursor).fieldValue === 'number' &&
    typeof (nextCursor as ProjectPageCursor).legacyId === 'string'
      ? (nextCursor as ProjectPageCursor)
      : null

  return {
    items: (value as { items: unknown[] }).items,
    nextCursor: parsedCursor,
  }
}
