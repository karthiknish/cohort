import { NextRequest, NextResponse } from 'next/server'
import { FieldPath, Timestamp, type Query, type QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { resolveWorkspaceContext, type WorkspaceContext } from '@/lib/workspace'
import { mapProjectDoc, projectStatusSchema, coerceStringArray, toISO } from '@/lib/projects'
import type { ProjectRecord } from '@/types/projects'
import { recordProjectCreatedNotification } from '@/lib/notifications'

const MAX_PROJECTS = 100

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
})

type ProjectListResponse = {
  projects: ProjectRecord[]
}

type ProjectStats = {
  taskCount: number
  openTaskCount: number
  recentActivityAt: string | null
}

export type { ProjectStats }

export async function calculateProjectStats(
  workspace: WorkspaceContext,
  projectId: string,
  baselineActivity: string | null
): Promise<ProjectStats> {
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
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get()

  if (!messagesSnapshot.empty) {
    const doc = messagesSnapshot.docs[0]
    const candidate = toISO(doc.get('createdAt'))
    if (candidate) {
      const date = new Date(candidate)
      if (!Number.isNaN(date.getTime()) && (!latestActivity || date > latestActivity)) {
        latestActivity = date
      }
    }
  }

  const recentActivityAt = latestActivity ? latestActivity.toISOString() : baselineActivity

  return {
    taskCount,
    openTaskCount,
    recentActivityAt,
  }
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

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema: projectQuerySchema,
    rateLimit: 'standard',
  },
  async (req, { workspace, query }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const { status, clientId, query: queryParam, pageSize: pageSizeParam, after: afterParam } = query
    const normalizedQuery = queryParam?.trim().toLowerCase() ?? null
    const pageSize = Math.min(Math.max(Number(pageSizeParam) || 50, 1), MAX_PROJECTS)
    const afterCursor = afterParam?.trim() || null

    let baseQuery = workspace.projectsCollection as Query

    if (status) {
      baseQuery = baseQuery.where('status', '==', status)
    }

    if (clientId) {
      baseQuery = baseQuery.where('clientId', '==', clientId)
    }

    let orderedQuery = baseQuery.orderBy('updatedAt', 'desc').orderBy(FieldPath.documentId(), 'desc')

    if (afterCursor) {
      const [cursorTime, cursorId] = afterCursor.split('|')
      if (cursorTime && cursorId) {
        const cursorDate = new Date(cursorTime)
        if (!Number.isNaN(cursorDate.getTime())) {
          orderedQuery = orderedQuery.startAfter(Timestamp.fromDate(cursorDate), cursorId)
        }
      }
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

    for (const doc of docs.slice(0, pageSize)) {
      const record = await buildProjectSummary(workspace, doc.id, doc.data() as Record<string, unknown>)
      mapped.push(record)
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
          return iso ? `${iso}|${nextCursorDoc.id}` : null
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
    })

    const createdDoc = await docRef.get()
    const project = await buildProjectSummary(workspace, createdDoc.id, createdDoc.data() as Record<string, unknown>)

    await recordProjectCreatedNotification({
      workspaceId: workspace.workspaceId,
      project,
      actorId: auth.uid!,
      actorName: auth.name!,
    })

    return { project }
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
