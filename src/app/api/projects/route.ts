import { NextRequest, NextResponse } from 'next/server'
import { FieldPath, Timestamp, type Query, type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { resolveWorkspaceContext, type WorkspaceContext } from '@/lib/workspace'
import { mapProjectDoc, projectStatusSchema, coerceStringArray, toISO } from '@/lib/projects'
import type { ProjectRecord } from '@/types/projects'
import { recordProjectCreatedNotification } from '@/lib/notifications'
import { logAuditAction } from '@/lib/audit-logger'
import { serverCache, workspaceCacheKey } from '@/lib/cache'
import { decodeTimestampIdCursor, encodeTimestampIdCursor, parsePageSize } from '@/lib/pagination'
import { buildProjectSummary } from '@/lib/projects-stats'
import type { ProjectStats } from '@/lib/projects-stats'

export { buildProjectSummary, calculateProjectStats } from '@/lib/projects-stats'
export type { ProjectStats } from '@/lib/projects-stats'

const MAX_PROJECTS = 100
const STATS_CACHE_TTL_MS = 30_000 // 30 seconds
const FIRESTORE_IN_QUERY_LIMIT = 10

function chunkArray<T>(values: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) {
    throw new Error('chunkSize must be positive')
  }

  const chunks: T[][] = []
  for (let i = 0; i < values.length; i += chunkSize) {
    chunks.push(values.slice(i, i + chunkSize))
  }
  return chunks
}

function parseISODate(value: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

async function calculateProjectStatsBatch(
  workspace: WorkspaceContext,
  baselines: Array<{ projectId: string; baselineActivity: string | null }>
): Promise<Map<string, ProjectStats>> {
  const statsByProjectId = new Map<string, ProjectStats>()
  const pending: Array<{ projectId: string; baselineActivity: string | null }> = []

  for (const baseline of baselines) {
    const cacheKey = workspaceCacheKey(workspace.workspaceId, 'projects', 'stats', baseline.projectId)
    const cached = await serverCache.get<ProjectStats>(cacheKey)
    if (cached) {
      statsByProjectId.set(baseline.projectId, cached)
      continue
    }
    pending.push(baseline)
  }

  if (pending.length === 0) {
    return statsByProjectId
  }

  const accumulator = new Map<
    string,
    { taskCount: number; openTaskCount: number; latestActivity: Date | null; baselineActivity: string | null }
  >()

  for (const { projectId, baselineActivity } of pending) {
    accumulator.set(projectId, {
      taskCount: 0,
      openTaskCount: 0,
      latestActivity: parseISODate(baselineActivity),
      baselineActivity,
    })
  }

  const projectIds = pending.map((item) => item.projectId)
  const chunks = chunkArray(projectIds, FIRESTORE_IN_QUERY_LIMIT)

  const taskSnapshots = await Promise.all(
    chunks.map((chunk) => workspace.tasksCollection.where('projectId', 'in', chunk).get())
  )
  for (const snapshot of taskSnapshots) {
    snapshot.forEach((doc) => {
      const data = doc.data() as Record<string, unknown>
      const projectId = typeof data.projectId === 'string' ? data.projectId : null
      if (!projectId) return

      const state = accumulator.get(projectId)
      if (!state) return

      state.taskCount += 1

      const status = typeof data.status === 'string' ? data.status : 'todo'
      if (status !== 'completed') {
        state.openTaskCount += 1
      }

      const candidate = toISO(data.updatedAt ?? data.createdAt)
      if (!candidate) return
      const date = new Date(candidate)
      if (Number.isNaN(date.getTime())) return
      if (!state.latestActivity || date > state.latestActivity) {
        state.latestActivity = date
      }
    })
  }

  const messageSnapshots = await Promise.all(
    chunks.map((chunk) =>
      workspace.collaborationCollection
        .where('channelType', '==', 'project')
        .where('projectId', 'in', chunk)
        .select('projectId', 'createdAt')
        .get()
    )
  )

  for (const snapshot of messageSnapshots) {
    snapshot.forEach((doc) => {
      const projectId = doc.get('projectId')
      if (typeof projectId !== 'string' || !projectId) return

      const state = accumulator.get(projectId)
      if (!state) return

      const candidate = toISO(doc.get('createdAt'))
      if (!candidate) return
      const date = new Date(candidate)
      if (Number.isNaN(date.getTime())) return
      if (!state.latestActivity || date > state.latestActivity) {
        state.latestActivity = date
      }
    })
  }

  for (const [projectId, state] of accumulator.entries()) {
    const recentActivityAt = state.latestActivity ? state.latestActivity.toISOString() : state.baselineActivity
    const stats: ProjectStats = {
      taskCount: state.taskCount,
      openTaskCount: state.openTaskCount,
      recentActivityAt,
    }

    const cacheKey = workspaceCacheKey(workspace.workspaceId, 'projects', 'stats', projectId)
    void serverCache.set(cacheKey, stats, STATS_CACHE_TTL_MS)

    statsByProjectId.set(projectId, stats)
  }

  return statsByProjectId
}

const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().trim().max(2000).optional(),
  status: projectStatusSchema.default('planning'),
  clientId: z.string().trim().max(120).optional(),
  clientName: z.string().trim().max(200).optional(),
  startDate: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), 'Invalid start date'),
  endDate: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), 'Invalid end date'),
  tags: z.array(z.string().trim().min(1).max(60)).default([]),
})

type CreateProjectInput = z.infer<typeof createProjectSchema>

const projectQuerySchema = z.object({
  status: projectStatusSchema.optional(),
  clientId: z.string().optional(),
  query: z.string().optional(),
  pageSize: z.string().optional(),
  after: z.string().optional(),
  includeStats: z.enum(['true', 'false']).optional(),
})

type ProjectListResponse = {
  projects: ProjectRecord[]
}

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema: projectQuerySchema,
    rateLimit: 'standard',
  },
  async (req, { workspace, query }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const { status, clientId, query: queryParam, pageSize: pageSizeParam, after: afterParam, includeStats: includeStatsParam } = query
    const normalizedQuery = queryParam?.trim().toLowerCase() ?? null
    const pageSize = parsePageSize(pageSizeParam, { defaultValue: 50, max: MAX_PROJECTS })
    const includeStats = includeStatsParam === 'true'
    const afterCursor = afterParam?.trim() || null

    let baseQuery = workspace.projectsCollection.where('deletedAt', '==', null) as Query

    if (status) {
      baseQuery = baseQuery.where('status', '==', status)
    }

    if (clientId) {
      baseQuery = baseQuery.where('clientId', '==', clientId)
    }

    let orderedQuery = baseQuery.orderBy('updatedAt', 'desc').orderBy(FieldPath.documentId(), 'desc')

    const decodedCursor = decodeTimestampIdCursor(afterCursor)
    if (decodedCursor) {
      orderedQuery = orderedQuery.startAfter(decodedCursor.time, decodedCursor.id)
    }

    let docs: QueryDocumentSnapshot[]

    try {
      const snapshot = await orderedQuery.limit(pageSize + 1).get()
      docs = snapshot.docs
    } catch (queryError) {
      if (!isMissingIndexError(queryError)) {
        throw queryError
      }

      const fallbackSnapshot = await baseQuery.limit(pageSize + 1).get()
      docs = fallbackSnapshot.docs.sort((a, b) => compareByUpdatedAtDesc(a, b))
    }

    const mapped: ProjectRecord[] = []

    if (includeStats) {
      const pageDocs = docs.slice(0, pageSize)
      const baseProjects = pageDocs.map((doc) => mapProjectDoc(doc.id, doc.data() as Record<string, unknown>))
      const statsByProjectId = await calculateProjectStatsBatch(
        workspace,
        baseProjects.map((project) => ({ projectId: project.id, baselineActivity: project.recentActivityAt }))
      )

      for (const base of baseProjects) {
        const stats = statsByProjectId.get(base.id) ?? {
          taskCount: 0,
          openTaskCount: 0,
          recentActivityAt: base.recentActivityAt,
        }

        mapped.push({
          ...base,
          taskCount: stats.taskCount,
          openTaskCount: stats.openTaskCount,
          recentActivityAt: stats.recentActivityAt,
        })
      }
    } else {
      // Fast path: skip stats calculation
      for (const doc of docs.slice(0, pageSize)) {
        const base = mapProjectDoc(doc.id, doc.data() as Record<string, unknown>)
        mapped.push(base)
      }
    }

    const filtered = normalizedQuery
      ? mapped.filter((project) => {
        const haystack = `${project.name} ${project.description ?? ''}`.toLowerCase()
        return haystack.includes(normalizedQuery)
      })
      : mapped

    const nextCursorDoc = docs.length > pageSize ? docs[pageSize] : null
    const nextCursor = nextCursorDoc
      ? (() => {
        const iso = toISO(nextCursorDoc.get('updatedAt') ?? nextCursorDoc.get('createdAt'))
        return iso ? encodeTimestampIdCursor(iso, nextCursorDoc.id) : null
      })()
      : null

    return { projects: filtered, nextCursor }
  }
)

export const POST = createApiHandler(
  {
    workspace: 'required',
    bodySchema: createProjectSchema,
    rateLimit: 'sensitive',
  },
  async (req, { auth, workspace, body }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const payload = body as CreateProjectInput
    const now = Timestamp.now()
    const startDate = payload.startDate ? Timestamp.fromDate(new Date(payload.startDate)) : null
    const endDate = payload.endDate ? Timestamp.fromDate(new Date(payload.endDate)) : null

    const tags = coerceStringArray(payload.tags)
    const clientId = payload.clientId?.trim() ?? null
    const clientName = payload.clientName?.trim() ?? null

    const docRef = await workspace.projectsCollection.add({
      name: payload.name,
      description: payload.description ?? null,
      status: payload.status,
      clientId,
      clientName,
      startDate,
      endDate,
      tags,
      ownerId: auth.uid,
      workspaceId: workspace.workspaceId,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    })

    const createdDoc = await docRef.get()
    const project = await buildProjectSummary(workspace, createdDoc.id, createdDoc.data() as Record<string, unknown>)

    await logAuditAction({
      action: 'PROJECT_CREATE',
      actorId: auth.uid!,
      targetId: project.id,
      workspaceId: workspace.workspaceId,
      metadata: {
        name: project.name,
        clientId: project.clientId,
      },
    })

    await recordProjectCreatedNotification({
      workspaceId: workspace.workspaceId,
      project,
      actorId: auth.uid!,
      actorName: auth.name!,
    })

    // Send Brevo email notification for new project
    try {
      const { notifyProjectCreatedEmail } = await import('@/lib/notifications')
      const creatorEmail = auth.email
      if (creatorEmail) {
        await notifyProjectCreatedEmail({
          recipientEmail: creatorEmail,
          recipientName: auth.name ?? undefined,
          projectName: project.name,
          clientName: project.clientName,
          createdBy: auth.name ?? null,
        })
      }
    } catch (emailError) {
      console.error('[projects] Brevo project creation email failed', emailError)
    }

    return project
  }
)

function isMissingIndexError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const code = (error as { code?: number | string }).code
  const message = (error as { message?: string }).message ?? ''

  if (code === 9 || code === 'FAILED_PRECONDITION') {
    return true
  }

  return message.toLowerCase().includes('requires an index')
}

function compareByUpdatedAtDesc(a: QueryDocumentSnapshot, b: QueryDocumentSnapshot): number {
  const aDate = parseDateFromDoc(a)
  const bDate = parseDateFromDoc(b)

  if (aDate && bDate) {
    return bDate.getTime() - aDate.getTime()
  }

  if (aDate) {
    return -1
  }
  if (bDate) {
    return 1
  }

  return b.id.localeCompare(a.id)
}

function parseDateFromDoc(doc: QueryDocumentSnapshot): Date | null {
  const candidate = doc.get('updatedAt') ?? doc.get('createdAt') ?? null
  const iso = toISO(candidate)
  if (!iso) {
    return null
  }

  const parsed = new Date(iso)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
