import { NextRequest, NextResponse } from 'next/server'
import { Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext, type WorkspaceContext } from '@/lib/workspace'
import { toISO } from '@/lib/projects'
import type { Activity, ActivityResponse } from '@/types/activity'
import { createApiHandler } from '@/lib/api-handler'

const MAX_ACTIVITIES = 50

const activityQuerySchema = z.object({
  clientId: z.string().trim().min(1, 'Client ID is required'),
  pageSize: z.coerce.number().int().min(1).max(MAX_ACTIVITIES).default(20),
  after: z.string().optional(),
})

async function createProjectActivity(
  workspace: WorkspaceContext,
  clientId: string,
  limit: number,
  after?: string
): Promise<Activity[]> {
  const activities: Activity[] = []
  
  // Get projects for this client
  let projectsQuery = workspace.projectsCollection
    .where('clientId', '==', clientId)
    .orderBy('updatedAt', 'desc')

  if (after) {
    const afterDate = new Date(after)
    if (!Number.isNaN(afterDate.getTime())) {
      projectsQuery = projectsQuery.startAfter(Timestamp.fromDate(afterDate))
    }
  }

  projectsQuery = projectsQuery.limit(limit)
  
  const projectsSnapshot = await projectsQuery.get()
  
  for (const doc of projectsSnapshot.docs) {
    const data = doc.data()
    activities.push({
      id: `project-${doc.id}`,
      type: 'project_updated',
      timestamp: toISO(data.updatedAt ?? data.createdAt) || new Date().toISOString(),
      clientId,
      entityId: doc.id,
      entityName: data.name || 'Untitled Project',
      description: `Project "${data.name || 'Untitled Project'}" was updated`,
      navigationUrl: `/dashboard/projects?projectId=${doc.id}&projectName=${encodeURIComponent(data.name || 'Untitled Project')}`,
    })
  }
  
  return activities
}

async function createTaskActivity(
  workspace: WorkspaceContext,
  clientId: string,
  limit: number,
  after?: string
): Promise<Activity[]> {
  const activities: Activity[] = []
  
  // Get tasks for projects belonging to this client
  // Use a more efficient approach to avoid Firestore's 10-item limit for 'in' operator
  let tasksQuery = workspace.tasksCollection
    .where('clientId', '==', clientId)
    .where('status', '==', 'completed')
    .orderBy('updatedAt', 'desc')

  if (after) {
    const afterDate = new Date(after)
    if (!Number.isNaN(afterDate.getTime())) {
      tasksQuery = tasksQuery.startAfter(Timestamp.fromDate(afterDate))
    }
  }

  tasksQuery = tasksQuery.limit(limit)
  
  const tasksSnapshot = await tasksQuery.get()
  
  // Get project details for each task
  const projectIds = [...new Set(tasksSnapshot.docs.map(doc => doc.data().projectId))]
  const projectDocs = await Promise.all(
    projectIds.map(async (projectId) => {
      const doc = await workspace.projectsCollection.doc(projectId).get()
      return { id: projectId, data: doc.data() }
    })
  )
  
  for (const doc of tasksSnapshot.docs) {
    const data = doc.data()
    const projectDoc = projectDocs.find(p => p.id === data.projectId)
    const projectName = projectDoc?.data?.name || 'Unknown Project'
    
    activities.push({
      id: `task-${doc.id}`,
      type: 'task_completed',
      timestamp: toISO(data.updatedAt ?? data.createdAt) || new Date().toISOString(),
      clientId,
      entityId: doc.id,
      entityName: data.title || 'Untitled Task',
      description: `Task "${data.title || 'Untitled Task'}" was completed`,
      navigationUrl: `/dashboard/tasks?projectId=${data.projectId}&projectName=${encodeURIComponent(projectName)}`,
    })
  }
  
  return activities
}

async function createMessageActivity(
  workspace: WorkspaceContext,
  clientId: string,
  limit: number,
  after?: string
): Promise<Activity[]> {
  const activities: Activity[] = []
  
  // Get collaboration messages for this client directly
  // Use a more efficient approach to avoid Firestore's 10-item limit for 'in' operator
  let messagesQuery = workspace.collaborationCollection
    .where('channelType', '==', 'project')
    .where('clientId', '==', clientId)
    .orderBy('createdAt', 'desc')

  if (after) {
    const afterDate = new Date(after)
    if (!Number.isNaN(afterDate.getTime())) {
      messagesQuery = messagesQuery.startAfter(Timestamp.fromDate(afterDate))
    }
  }

  messagesQuery = messagesQuery.limit(limit)
  
  const messagesSnapshot = await messagesQuery.get()
  
  // Get project details for each message
  const projectIds = [...new Set(messagesSnapshot.docs.map(doc => doc.data().projectId))]
  const projectDocs = await Promise.all(
    projectIds.map(async (projectId) => {
      const doc = await workspace.projectsCollection.doc(projectId).get()
      return { id: projectId, data: doc.data() }
    })
  )
  
  for (const doc of messagesSnapshot.docs) {
    const data = doc.data()
    const projectDoc = projectDocs.find(p => p.id === data.projectId)
    const projectName = projectDoc?.data?.name || 'Unknown Project'
    
    activities.push({
      id: `message-${doc.id}`,
      type: 'message_posted',
      timestamp: toISO(data.createdAt) || new Date().toISOString(),
      clientId,
      entityId: doc.id,
      entityName: projectName,
      description: `New message in "${projectName}"`,
      navigationUrl: `/dashboard/collaboration?projectId=${data.projectId}&projectName=${encodeURIComponent(projectName)}`,
    })
  }
  
  return activities
}

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema: activityQuerySchema,
    rateLimit: 'standard',
  },
  async (req, { auth, workspace, query }) => {
    if (!workspace) throw new Error('Workspace context missing')
    // Fetch activities from different sources
    // Fetch one extra to determine if there's more
    const limitPerType = Math.ceil(query.pageSize / 3) + 1

    const [projectActivities, taskActivities, messageActivities] = await Promise.all([
      createProjectActivity(workspace, query.clientId, limitPerType, query.after),
      createTaskActivity(workspace, query.clientId, limitPerType, query.after),
      createMessageActivity(workspace, query.clientId, limitPerType, query.after),
    ])

    // Combine and sort all activities by timestamp (most recent first)
    const allActivities = [...projectActivities, ...taskActivities, ...messageActivities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    // Apply pagination
    const paginatedActivities = allActivities.slice(0, query.pageSize)
    const hasMore = allActivities.length > query.pageSize
    
    const nextCursor = paginatedActivities.length > 0 
      ? paginatedActivities[paginatedActivities.length - 1].timestamp 
      : null

    const response = {
      activities: paginatedActivities,
      nextCursor,
      hasMore,
    }

    return response
  }
)
