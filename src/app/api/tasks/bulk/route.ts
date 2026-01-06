import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'

import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError, ValidationError } from '@/lib/api-errors'
import { TASK_PRIORITIES, TASK_STATUSES, TaskPriority, TaskStatus, TaskRecord } from '@/types/tasks'
import { mapTaskDoc, invalidateTasksCache } from '../route'
import type { StoredTask } from '@/types/stored-types'

const bulkUpdateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one task ID is required').max(50, 'Maximum 50 tasks per request'),
  update: z.object({
    status: z.enum(TASK_STATUSES).optional(),
    priority: z.enum(TASK_PRIORITIES).optional(),
    assignedTo: z.array(z.string().trim().min(1).max(120)).optional(),
    tags: z.array(z.string().trim().min(1).max(60)).optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field to update is required' }
  ),
})

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'At least one task ID is required').max(50, 'Maximum 50 tasks per request'),
})

/**
 * PATCH /api/tasks/bulk - Update multiple tasks at once
 */
export const PATCH = createApiHandler(
  {
    workspace: 'required',
    bodySchema: bulkUpdateSchema,
    rateLimit: 'bulk',
  },
  async (req, { auth, workspace, body }) => {
    if (!workspace) throw new Error('Workspace context missing')
    
    const { ids, update } = body
    const now = Timestamp.now()
    const batch = workspace.tasksCollection.firestore.batch()
    
    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    }
    
    if (update.status !== undefined) updateData.status = update.status
    if (update.priority !== undefined) updateData.priority = update.priority
    if (update.assignedTo !== undefined) {
      updateData.assignedTo = update.assignedTo.map(s => s.trim()).filter(s => s.length > 0)
    }
    if (update.tags !== undefined) {
      updateData.tags = update.tags.map(s => s.trim()).filter(s => s.length > 0)
    }
    
    // Fetch all tasks in one round-trip
    const docRefs = ids.map(id => workspace.tasksCollection.doc(id))
    const snapshots = await workspace.tasksCollection.firestore.getAll(...docRefs)
    
    const results: { id: string; success: boolean; error?: string }[] = []
    const updatedTasks: TaskRecord[] = []
    
    for (const snapshot of snapshots) {
      const id = snapshot.id
      if (!snapshot.exists) {
        results.push({ id, success: false, error: `Task with ID '${id}' not found` })
        continue
      }
      
      batch.update(snapshot.ref, updateData)
      
      // Construct updated object manually to avoid a redundant post-update GET
      const existingData = snapshot.data() as StoredTask
      const task = mapTaskDoc(id, { ...existingData, ...updateData } as StoredTask)
      updatedTasks.push(task)
      results.push({ id, success: true })
    }
    
    if (results.some(r => r.success)) {
      await batch.commit()
    }
    
    // Invalidate cache
    invalidateTasksCache(workspace.workspaceId)
    
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length
    
    return {
      message: `Updated ${successCount} tasks, ${failCount} failed`,
      results,
      tasks: updatedTasks,
    }
  }
)

/**
 * DELETE /api/tasks/bulk - Delete multiple tasks at once
 */
export const DELETE = createApiHandler(
  {
    workspace: 'required',
    adminOnly: true,
    bodySchema: bulkDeleteSchema,
    rateLimit: 'bulk',
  },
  async (req, { auth, workspace, body }) => {
    if (!workspace) throw new Error('Workspace context missing')
    
    const { ids } = body
    const batch = workspace.tasksCollection.firestore.batch()
    
    // Fetch all tasks in one round-trip to verify existence
    const docRefs = ids.map(id => workspace.tasksCollection.doc(id))
    const snapshots = await workspace.tasksCollection.firestore.getAll(...docRefs)
    
    const results: { id: string; success: boolean; error?: string }[] = []
    
    for (const snapshot of snapshots) {
      const id = snapshot.id
      if (!snapshot.exists) {
        results.push({ id, success: false, error: `Task with ID '${id}' not found` })
        continue
      }
      
      batch.delete(snapshot.ref)
      results.push({ id, success: true })
    }
    
    if (results.some(r => r.success)) {
      await batch.commit()
    }
    
    // Invalidate cache
    invalidateTasksCache(workspace.workspaceId)
    
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length
    
    return {
      message: `Deleted ${successCount} tasks, ${failCount} failed`,
      results,
    }
  }
)
