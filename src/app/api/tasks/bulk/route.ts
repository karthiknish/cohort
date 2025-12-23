import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'

import { createApiHandler } from '@/lib/api-handler'
import { NotFoundError, ValidationError } from '@/lib/api-errors'
import { TASK_PRIORITIES, TASK_STATUSES, TaskPriority, TaskStatus } from '@/types/tasks'
import { mapTaskDoc, StoredTask, invalidateTasksCache } from '../route'

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
    
    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: now,
    }
    
    if (update.status !== undefined) {
      updateData.status = update.status
    }
    if (update.priority !== undefined) {
      updateData.priority = update.priority
    }
    if (update.assignedTo !== undefined) {
      updateData.assignedTo = update.assignedTo.map(s => s.trim()).filter(s => s.length > 0)
    }
    if (update.tags !== undefined) {
      updateData.tags = update.tags.map(s => s.trim()).filter(s => s.length > 0)
    }
    
    // Fetch and update tasks
    const results: { id: string; success: boolean; error?: string }[] = []
    const updatedTasks = []
    
    for (const id of ids) {
      try {
        const docRef = workspace.tasksCollection.doc(id)
        const doc = await docRef.get()
        
        if (!doc.exists) {
          results.push({ id, success: false, error: `Task with ID '${id}' not found` })
          continue
        }
        
        await docRef.update(updateData)
        const updatedDoc = await docRef.get()
        const task = mapTaskDoc(updatedDoc.id, updatedDoc.data() as StoredTask)
        updatedTasks.push(task)
        results.push({ id, success: true })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        results.push({ id, success: false, error: message })
      }
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
    
    const results: { id: string; success: boolean; error?: string }[] = []
    
    for (const id of ids) {
      try {
        const docRef = workspace.tasksCollection.doc(id)
        const doc = await docRef.get()
        
        if (!doc.exists) {
          results.push({ id, success: false, error: `Task with ID '${id}' not found` })
          continue
        }
        
        await docRef.delete()
        results.push({ id, success: true })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        results.push({ id, success: false, error: message })
      }
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
