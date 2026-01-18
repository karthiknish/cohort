'use client'

import { useEffect, useState } from 'react'
import { useQuery } from 'convex/react'

import { projectsApi } from '@/lib/convex-api'
import type { ProjectRecord } from '@/types/projects'

interface UseProjectsDataOptions {
  workspaceId: string | null
  userId: string | null
  selectedClientId?: string | null
  isPreviewMode: boolean
}

export function useProjectsData({
  workspaceId,
  userId,
  selectedClientId,
  isPreviewMode,
}: UseProjectsDataOptions) {
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)

  const projectsRealtime = useQuery(
    projectsApi.list,
    isPreviewMode || !workspaceId || !userId
      ? 'skip'
      : {
          workspaceId,
          clientId: selectedClientId ?? undefined,
          limit: 100,
        }
  ) as Array<any> | undefined

  useEffect(() => {
    if (isPreviewMode || !workspaceId || !userId) {
      setProjects([])
      setProjectsLoading(false)
      return
    }

    if (!projectsRealtime) {
      setProjectsLoading(true)
      return
    }

    const rows = Array.isArray(projectsRealtime) ? projectsRealtime : []
    const mapped: ProjectRecord[] = rows.map((row: any) => ({
      id: String(row.legacyId),
      name: String(row.name ?? ''),
      description: typeof row.description === 'string' ? row.description : null,
      status: row.status,
      clientId: typeof row.clientId === 'string' ? row.clientId : null,
      clientName: typeof row.clientName === 'string' ? row.clientName : null,
      startDate: typeof row.startDateMs === 'number' ? new Date(row.startDateMs).toISOString() : null,
      endDate: typeof row.endDateMs === 'number' ? new Date(row.endDateMs).toISOString() : null,
      tags: Array.isArray(row.tags) ? row.tags : [],
      ownerId: typeof row.ownerId === 'string' ? row.ownerId : null,
      createdAt: typeof row.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null,
      updatedAt: typeof row.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null,
      taskCount: 0,
      openTaskCount: 0,
      recentActivityAt: null,
      deletedAt: typeof row.deletedAtMs === 'number' ? new Date(row.deletedAtMs).toISOString() : null,
    }))

    setProjects(mapped)
    setProjectsLoading(false)
  }, [isPreviewMode, projectsRealtime, userId, workspaceId])

  return { projects, projectsLoading }
}
