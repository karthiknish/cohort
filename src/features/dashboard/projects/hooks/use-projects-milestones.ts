'use client'

import { useQuery } from 'convex/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

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
  const [milestonesByProject, setMilestonesByProject] = useState<Record<string, MilestoneRecord[]>>({})
  const [milestonesLoading, setMilestonesLoading] = useState(false)
  const [milestonesError, setMilestonesError] = useState<string | null>(null)

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

  useEffect(() => {
    if (viewMode !== 'gantt') {
      setMilestonesByProject({})
      setMilestonesLoading(false)
      setMilestonesError(null)
      return
    }

    setMilestonesByProject(syncedMilestones)
    setMilestonesLoading(milestonesQueryEnabled && milestonesRealtime === undefined)
    setMilestonesError(milestonesQueryError)
  }, [milestonesQueryEnabled, milestonesQueryError, milestonesRealtime, syncedMilestones, viewMode])

  const loadMilestones = useCallback(
    async (targetProjectIds: string[]) => {
      if (viewMode !== 'gantt') {
        return
      }

      setMilestonesLoading(true)
      setMilestonesError(null)

      try {
        if (isPreviewMode) {
          setMilestonesByProject(getPreviewProjectMilestones(selectedClientId ?? null, targetProjectIds))
          return
        }

        if (!milestonesRealtime || typeof milestonesRealtime !== 'object') {
          setMilestonesByProject({})
          return
        }

        const mapped: Record<string, MilestoneRecord[]> = {}
        const projectIdSet = new Set(targetProjectIds)

        for (const [projectId, rows] of Object.entries(milestonesRealtime)) {
          if (projectIdSet.size > 0 && !projectIdSet.has(projectId)) {
            continue
          }

          mapped[projectId] = (Array.isArray(rows) ? rows : []).map(mapMilestoneRecord)
        }

        setMilestonesByProject(mapped)
      } catch (err) {
        logError(err, 'useProjectsMilestones:loadMilestones')
        setMilestonesError(asErrorMessage(err))
        setMilestonesByProject({})
      } finally {
        setMilestonesLoading(false)
      }
    },
    [isPreviewMode, milestonesRealtime, selectedClientId, viewMode],
  )

  const handleMilestoneCreated = useCallback((milestone: MilestoneRecord) => {
    setMilestonesByProject((previous) => {
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
