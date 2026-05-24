'use client'

import { useQuery } from 'convex/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { projectMilestonesApi } from '@/lib/convex-api'
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

function reconcileMilestonePatches(
  patches: Record<string, MilestoneRecord[]>,
  syncedMilestones: Record<string, MilestoneRecord[]>,
  projectIds: string[],
): Record<string, MilestoneRecord[]> {
  if (Object.keys(patches).length === 0) {
    return patches
  }

  const projectIdSet = new Set(projectIds)
  const syncedIdsByProject = new Map<string, Set<string>>()

  for (const [projectId, milestones] of Object.entries(syncedMilestones)) {
    syncedIdsByProject.set(projectId, new Set(milestones.map((milestone) => milestone.id)))
  }

  const next: Record<string, MilestoneRecord[]> = {}
  let changed = false

  for (const [projectId, pending] of Object.entries(patches)) {
    if (!projectIdSet.has(projectId)) {
      changed = true
      continue
    }

    const syncedIds = syncedIdsByProject.get(projectId) ?? new Set<string>()
    const unresolved = pending.filter((milestone) => !syncedIds.has(milestone.id))

    if (unresolved.length > 0) {
      next[projectId] = unresolved
    }

    if (unresolved.length !== pending.length) {
      changed = true
    }
  }

  return changed ? next : patches
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
  const [milestonesRefreshKey, setMilestonesRefreshKey] = useState(0)

  const projectIds = useMemo(() => projects.map((project) => project.id), [projects])
  const milestonesQueryEnabled = !isPreviewMode && viewMode === 'gantt' && Boolean(workspaceId && userId)

  const patchScopeKey = useMemo(
    () => `${viewMode}:${selectedClientId ?? ''}:${projectIds.join(',')}`,
    [projectIds, selectedClientId, viewMode],
  )

  const milestonesRealtime = useQuery(
    projectMilestonesApi.listByProjectIds,
    milestonesQueryEnabled && projectIds.length > 0
      ? {
          workspaceId: workspaceId!,
          projectIds,
          refreshKey: milestonesRefreshKey,
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
    setMilestonePatches({})
  }, [patchScopeKey])

  useEffect(() => {
    setMilestonePatches((previous) => reconcileMilestonePatches(previous, syncedMilestones, projectIds))
  }, [projectIds, syncedMilestones])

  const milestonesByProject = useMemo(() => {
    if (viewMode !== 'gantt') {
      return {}
    }

    const merged = { ...syncedMilestones }

    for (const [projectId, extras] of Object.entries(milestonePatches)) {
      const syncedIds = new Set((merged[projectId] ?? []).map((milestone) => milestone.id))
      const pending = extras.filter((milestone) => !syncedIds.has(milestone.id))

      if (pending.length > 0) {
        merged[projectId] = [...(merged[projectId] ?? []), ...pending]
      }
    }

    return merged
  }, [milestonePatches, syncedMilestones, viewMode])

  const milestonesLoading =
    viewMode === 'gantt' && milestonesQueryEnabled && milestonesRealtime === undefined

  const milestonesError = viewMode === 'gantt' ? milestonesQueryError : null

  const loadMilestones = useCallback(
    async (_targetProjectIds: string[]) => {
      if (viewMode !== 'gantt') {
        return
      }

      setMilestonePatches({})

      if (!isPreviewMode) {
        setMilestonesRefreshKey((previous) => previous + 1)
      }
    },
    [isPreviewMode, viewMode],
  )

  const handleMilestoneCreated = useCallback((milestone: MilestoneRecord) => {
    setMilestonePatches((previous) => {
      const existing = previous[milestone.projectId] ?? []
      if (existing.some((entry) => entry.id === milestone.id)) {
        return previous
      }

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
