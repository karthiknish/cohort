import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { authenticateRequest, AuthenticationError } from '@/lib/server-auth'
import { resolveWorkspaceContext, type WorkspaceContext } from '@/lib/workspace'
import { toISO } from '@/lib/projects'
import type { Activity, ActivityResponse } from '@/types/activity'

const MAX_ACTIVITIES = 50

const activityQuerySchema = z.object({
  clientId: z.string().trim().min(1, 'Client ID is required'),
  limit: z.coerce.number().int().min(1).max(MAX_ACTIVITIES).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

async function createProjectActivity(
  workspace: WorkspaceContext,
  clientId: string,
  limit: number
): Promise<Activity[]> {
  const activities: Activity[] = []
  
  // Get projects for this client
  const projectsQuery = workspace.projectsCollection
    .where('clientId', '==', clientId)
    .orderBy('updatedAt', 'desc')
    .limit(limit)
  
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
  limit: number
): Promise<Activity[]> {
  const activities: Activity[] = []
  
  // Get tasks for projects belonging to this client
  // Use a more efficient approach to avoid Firestore's 10-item limit for 'in' operator
  const tasksQuery = workspace.tasksCollection
    .where('clientId', '==', clientId)
    .where('status', '==', 'completed')
    .orderBy('updatedAt', 'desc')
    .limit(limit)
  
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
  limit: number
): Promise<Activity[]> {
  const activities: Activity[] = []
  
  // Get collaboration messages for this client directly
  // Use a more efficient approach to avoid Firestore's 10-item limit for 'in' operator
  const messagesQuery = workspace.collaborationCollection
    .where('channelType', '==', 'project')
    .where('clientId', '==', clientId)
    .orderBy('createdAt', 'desc')
    .limit(limit)
  
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

export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const auth = await authenticateRequest(request)
    if (!auth.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = activityQuerySchema.parse({
      clientId: searchParams.get('clientId'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    // Resolve workspace context
    const workspace = await resolveWorkspaceContext(auth)

    // Fetch activities from different sources
    const limitPerType = Math.ceil(query.limit / 3)
    
    const [projectActivities, taskActivities, messageActivities] = await Promise.all([
      createProjectActivity(workspace, query.clientId, limitPerType + query.offset),
      createTaskActivity(workspace, query.clientId, limitPerType + query.offset),
      createMessageActivity(workspace, query.clientId, limitPerType + query.offset),
    ])

    // Combine and sort all activities by timestamp (most recent first)
    const allActivities = [...projectActivities, ...taskActivities, ...messageActivities]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Apply pagination
    const paginatedActivities = allActivities.slice(query.offset, query.offset + query.limit)
    const hasMore = query.offset + query.limit < allActivities.length

    const response: ActivityResponse = {
      activities: paginatedActivities,
      hasMore,
      total: allActivities.length,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Activity API error:', error)
    
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.issues }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
