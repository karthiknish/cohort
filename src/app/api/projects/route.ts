import { NextRequest, NextResponse } from 'next/server'
import { FieldPath, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext, type WorkspaceContext } from '@/lib/workspace'
import { mapProjectDoc, projectStatusSchema, coerceStringArray, toISO } from '@/lib/projects'
import type { ProjectRecord } from '@/types/projects'

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

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const workspace = await resolveWorkspaceContext(auth)

    const searchParams = request.nextUrl.searchParams
    const statusParam = searchParams.get('status')
    const clientIdParam = searchParams.get('clientId')
    const queryParam = searchParams.get('query')?.trim().toLowerCase() ?? null

    let query = workspace.projectsCollection.orderBy('updatedAt', 'desc').orderBy(FieldPath.documentId(), 'desc')

    if (statusParam) {
      const parseStatus = projectStatusSchema.safeParse(statusParam)
      if (!parseStatus.success) {
        return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
      }
      query = query.where('status', '==', parseStatus.data)
    }

    if (clientIdParam) {
      query = query.where('clientId', '==', clientIdParam)
    }

    const snapshot = await query.limit(MAX_PROJECTS).get()
    const mapped: ProjectRecord[] = []

    for (const doc of snapshot.docs) {
      const record = await buildProjectSummary(workspace, doc.id, doc.data() as Record<string, unknown>)
      mapped.push(record)
    }

    const filtered = queryParam
      ? mapped.filter((project) => {
          const haystack = `${project.name} ${project.description ?? ''}`.toLowerCase()
          return haystack.includes(queryParam)
        })
      : mapped

    const response: ProjectListResponse = { projects: filtered }
    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('[projects] GET failed', error)
    return NextResponse.json({ error: 'Failed to load projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      throw new AuthenticationError('Authentication required', 401)
    }

    const workspace = await resolveWorkspaceContext(auth)

    const json = (await request.json().catch(() => null)) ?? {}
    const payload = createProjectSchema.parse(json) satisfies CreateProjectInput

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

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('[projects] POST failed', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
