import type { ProjectRecord } from '@/types/projects'

import { serverCache, workspaceCacheKey } from '@/lib/cache'
import { mapProjectDoc, toISO } from '@/lib/projects'
import type { WorkspaceContext } from '@/lib/workspace'

export type ProjectStats = {
  taskCount: number
  openTaskCount: number
  recentActivityAt: string | null
}

const STATS_CACHE_TTL_MS = 30_000 // 30 seconds

export async function calculateProjectStats(
  workspace: WorkspaceContext,
  projectId: string,
  baselineActivity: string | null
): Promise<ProjectStats> {
  const cacheKey = workspaceCacheKey(workspace.workspaceId, 'projects', 'stats', projectId)
  const cached = await serverCache.get<ProjectStats>(cacheKey)
  if (cached) {
    return cached
  }

  let latestActivity: Date | null = baselineActivity ? new Date(baselineActivity) : null
  let taskCount = 0
  let openTaskCount = 0

  const tasksSnapshot = await workspace.tasksCollection.where('projectId', '==', projectId).get()
  tasksSnapshot.forEach((doc) => {
    const data = doc.data() as Record<string, unknown>
    taskCount += 1
    const status = typeof data.status === 'string' ? data.status : 'todo'
    if (status !== 'completed') {
      openTaskCount += 1
    }
    const candidate = toISO(data.updatedAt ?? data.createdAt)
    if (candidate) {
      const date = new Date(candidate)
      if (!Number.isNaN(date.getTime()) && (!latestActivity || date > latestActivity)) {
        latestActivity = date
      }
    }
  })

  const messagesSnapshot = await workspace.collaborationCollection
    .where('channelType', '==', 'project')
    .where('projectId', '==', projectId)
    .select('createdAt')
    .get()

  messagesSnapshot.forEach((doc) => {
    const candidate = toISO(doc.get('createdAt'))
    if (!candidate) return

    const date = new Date(candidate)
    if (Number.isNaN(date.getTime())) return

    if (!latestActivity || date > latestActivity) {
      latestActivity = date
    }
  })

  const recentActivityAt = latestActivity ? latestActivity.toISOString() : baselineActivity

  const stats: ProjectStats = {
    taskCount,
    openTaskCount,
    recentActivityAt,
  }

  void serverCache.set(cacheKey, stats, STATS_CACHE_TTL_MS)
  return stats
}

export async function buildProjectSummary(
  workspace: WorkspaceContext,
  docId: string,
  data: Record<string, unknown>
): Promise<ProjectRecord> {
  const base = mapProjectDoc(docId, data)
  const stats = await calculateProjectStats(workspace, docId, base.recentActivityAt)
  return {
    ...base,
    taskCount: stats.taskCount,
    openTaskCount: stats.openTaskCount,
    recentActivityAt: stats.recentActivityAt,
  }
}
