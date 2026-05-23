'use client'

import { useQuery } from 'convex/react'
import { useCallback, useMemo, useState } from 'react'

import { projectMilestonesApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error'
import { getPreviewProjectMilestones } from '@/lib/preview-data'
import type { MilestoneRecord } from '@/types/milestones'
import type { ProjectRecord } from '@/types/projects'
import type { ViewMode } from '../components/utils'
import { mapMilestoneRecord } from './map-project-record'

export type UseProjectsMilestonesArgs = {
  workspaceId: string | null
  userId: string | undefined
  isPreviewMode: boolean
  selectedClientId: string | null | undefined
  viewMode: ViewMode
  projects: ProjectRecord[]
}

export function useProjectsMilestones({
  workspaceId,
  userId,
  isPreviewMode,
  selectedClientId,
  viewMode,
  projects,
}: UseProjectsMilestonesArgs) {
  const [milestonePatches, setMilestonePatches] = useState<Record<string, MilestoneRecord[]>>({})

  const projectIds = useMemo(() => projects.map((project) => project.id), [projects])
  const milestonesQueryEnabled = !isPreviewMode && viewMode === 'gantt' && Boolean(workspaceId && userId)

  const milestonesRealtime = useQuery(
    projectMilestonesApi.listByProjectIds,
    milestonesQueryEnabled && projectIds.length > 0
      ? {
          workspaceId: workspaceId!,
          projectIds,
        }
      : 'skip',
  )

  const milestonesQueryError = useConvexQueryError({
    data: milestonesRealtime,
    skipped: !milestonesQueryEnabled,
    fallbackMessage: 'Unable to load milestones.',
  })

  const syncedMilestones = useMemo(() => {
    if (viewMode !== 'gantt') {
      return {} as Record<string, MilestoneRecord[]>
    }

    if (isPreviewMode) {
      return getPreviewProjectMilestones(selectedClientId ?? null, projectIds)
    }

    if (!milestonesRealtime || typeof milestonesRealtime !== 'object') {
      return {} as Record<string, MilestoneRecord[]>
    }

    const mapped: Record<string, MilestoneRecord[]> = {}
    const projectIdSet = new Set(projectIds)

    for (const [projectId, rows] of Object.entries(milestonesRealtime)) {
      if (projectIdSet.size > 0 && !projectIdSet.has(projectId)) {
        continue
      }

      mapped[projectId] = (Array.isArray(rows) ? rows : []).map(mapMilestoneRecord)
    }

    return mapped
  }, [isPreviewMode, milestonesRealtime, projectIds, selectedClientId, viewMode])

  const milestonesByProject = useMemo(() => {
    if (viewMode !== 'gantt') {
      return {}
    }

    const merged = { ...syncedMilestones }
    for (const [projectId, extras] of Object.entries(milestonePatches)) {
      merged[projectId] = [...(merged[projectId] ?? []), ...extras]
    }
    return merged
  }, [milestonePatches, syncedMilestones, viewMode])

  const milestonesLoading =
    viewMode === 'gantt' && milestonesQueryEnabled && milestonesRealtime === undefined

  const milestonesError = viewMode === 'gantt' ? milestonesQueryError : null

  const loadMilestones = useCallback(async (_targetProjectIds: string[]) => {
    // Milestone rows refresh via `listByProjectIds` when `projectIds` changes.
  }, [])

  const handleMilestoneCreated = useCallback((milestone: MilestoneRecord) => {
    setMilestonePatches((previous) => {
      const existing = previous[milestone.projectId] ?? []
      return { ...previous, [milestone.projectId]: [...existing, milestone] }
    })
  }, [])

  return {
    milestonesByProject,
    milestonesLoading,
    milestonesError,
    loadMilestones,
    handleMilestoneCreated,
  }
}
