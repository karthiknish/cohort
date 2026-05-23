'use client'

import { useQuery } from 'convex/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { projectsApi, tasksApi } from '@/lib/convex-api'
import { useAccumulatedCursorPages } from '@/lib/hooks/use-accumulated-cursor-pages'
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error'
import { getPreviewProjects } from '@/lib/preview-data'
import type { ProjectRecord } from '@/types/projects'
import type { StatusFilter } from '../components/utils'
import { mergeProjectTaskCounts } from '../components/utils'
import { mapProjectRecord } from './map-project-record'
import {
  mergeProjectPages,
  parsePaginatedProjectsQuery,
  PROJECTS_PAGE_SIZE,
  type ProjectPageCursor,
} from './use-projects-pagination'

export type UseProjectsDataArgs = {
  workspaceId: string | null
  userId: string | undefined
  isPreviewMode: boolean
  selectedClientId: string | null | undefined
  statusFilter: StatusFilter
  debouncedSearchQuery: string
}

export function useProjectsData({
  workspaceId,
  userId,
  isPreviewMode,
  selectedClientId,
  statusFilter,
  debouncedSearchQuery,
}: UseProjectsDataArgs) {
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [loadCursor, setLoadCursor] = useState<ProjectPageCursor | null>(null)

  const searchQuery = debouncedSearchQuery.trim()
  const paginationScopeKey = [
    workspaceId ?? '',
    selectedClientId ?? '',
    statusFilter,
    searchQuery,
    isPreviewMode ? 'preview' : 'live',
  ].join('|')

  const queryEnabled = !isPreviewMode && Boolean(workspaceId && userId)

  const listArgs = useMemo(
    () => ({
      workspaceId: workspaceId!,
      limit: PROJECTS_PAGE_SIZE,
      cursor: loadCursor,
      clientId: selectedClientId ?? undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      searchQuery: searchQuery || undefined,
    }),
    [loadCursor, searchQuery, selectedClientId, statusFilter, workspaceId],
  )

  const projectsRealtime = useQuery(projectsApi.list, queryEnabled ? listArgs : 'skip')

  const projectsQueryError = useConvexQueryError({
    data: projectsRealtime,
    skipped: !queryEnabled,
    fallbackMessage: 'Unable to load projects.',
  })

  const {
    mergedItems: paginatedProjects,
    nextCursor: projectsNextCursor,
    isInitialLoading: projectsInitialLoading,
    isLoadingMore: projectsLoadingMore,
    loadMore: loadMoreProjects,
    reset: resetProjectPagination,
  } = useAccumulatedCursorPages<ProjectRecord, ProjectPageCursor>({
    scopeKey: paginationScopeKey,
    queryData: projectsRealtime,
    loadCursor,
    setLoadCursor,
    enabled: queryEnabled,
    getItemKey: (project) => project.id,
    parsePage: (queryData) => {
      const paginated = parsePaginatedProjectsQuery(queryData)
      if (!paginated) {
        return { items: [], nextCursor: null }
      }

      return {
        items: paginated.items.map((row) => mapProjectRecord(row)),
        nextCursor: paginated.nextCursor,
      }
    },
    mergePages: mergeProjectPages,
  })

  const loadedProjectIds = useMemo(
    () => paginatedProjects.map((project) => project.id),
    [paginatedProjects],
  )

  const taskCountsRealtime = useQuery(
    tasksApi.summarizeCountsByProject,
    queryEnabled && loadedProjectIds.length > 0
      ? {
          workspaceId: workspaceId!,
          clientId: selectedClientId ?? undefined,
          projectIds: loadedProjectIds,
        }
      : 'skip',
  )

  const projectsWithTaskCounts = useMemo(() => {
    if (isPreviewMode) {
      let previewProjects = getPreviewProjects(selectedClientId ?? null)
      if (statusFilter !== 'all') {
        previewProjects = previewProjects.filter((project) => project.status === statusFilter)
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        previewProjects = previewProjects.filter(
          (project) =>
            project.name.toLowerCase().includes(query) ||
            project.description?.toLowerCase().includes(query) ||
            project.clientName?.toLowerCase().includes(query),
        )
      }
      return previewProjects
    }

    const counts =
      taskCountsRealtime && typeof taskCountsRealtime === 'object'
        ? (taskCountsRealtime as Record<string, { taskCount: number; openTaskCount: number }>)
        : {}

    return paginatedProjects.map((project) => mergeProjectTaskCounts(project, counts))
  }, [
    isPreviewMode,
    paginatedProjects,
    searchQuery,
    selectedClientId,
    statusFilter,
    taskCountsRealtime,
  ])

  useEffect(() => {
    setProjects(projectsWithTaskCounts)
  }, [projectsWithTaskCounts])

  const loading = queryEnabled && projectsInitialLoading
  const loadingMore = projectsLoadingMore
  const error = projectsQueryError ?? null

  const handleRefresh = useCallback(() => {
    resetProjectPagination()
  }, [resetProjectPagination])

  return {
    projects,
    setProjects,
    loading,
    loadingMore,
    error,
    hasMoreProjects: Boolean(projectsNextCursor),
    handleLoadMore: loadMoreProjects,
    handleRefresh,
    resetPagination: resetProjectPagination,
  }
}
