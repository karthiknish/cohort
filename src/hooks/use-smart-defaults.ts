'use client'

import { useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { useProjectContext } from '@/contexts/project-context'
import type { TaskRecord } from '@/types/tasks'

interface SmartDefaults {
  taskDefaults: Partial<TaskRecord>
  contextInfo: {
    clientId: string | null
    clientName: string | null
    projectId: string | null
    projectName: string | null
    userId: string | null
    isAutoPopulated: boolean
  }
}

export function useSmartDefaults(): SmartDefaults {
  const { user } = useAuth()
  const { selectedClient, selectedClientId } = useClientContext()
  const { selectedProject, selectedProjectId, isFromUrl } = useProjectContext()

  // Calculate smart defaults for tasks
  const taskDefaults = useMemo(() => {
    const defaults: Partial<TaskRecord> = {
      // Auto-populate client context
      clientId: selectedClientId || null,
      client: selectedClient?.name || null,
      
      // Auto-populate project context if available
      projectId: selectedProjectId || null,
      projectName: selectedProject?.name || null,
      
      // Smart defaults for task properties
      assignedTo: user?.id ? [user.id] : [],
      priority: 'medium' as const,
      status: 'todo' as const,
      
      // Calculate due date (7 days from now)
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      
      // Default empty arrays/collections
      tags: [],
      description: '',
    }

    return defaults
  }, [
    selectedClientId,
    selectedClient,
    selectedProjectId,
    selectedProject,
    user?.id,
  ])

  // Context information for debugging and UI display
  const contextInfo = useMemo(() => ({
    clientId: selectedClientId || null,
    clientName: selectedClient?.name || null,
    projectId: selectedProjectId || null,
    projectName: selectedProject?.name || null,
    userId: user?.id || null,
    isAutoPopulated: isFromUrl || !!selectedClientId,
  }), [
    selectedClientId,
    selectedClient?.name,
    selectedProjectId,
    selectedProject?.name,
    user?.id,
    isFromUrl,
  ])

  return {
    taskDefaults,
    contextInfo,
  }
}

// Helper function to create a task with smart defaults
export function createTaskWithDefaults(
  overrides: Partial<TaskRecord>,
  smartDefaults: SmartDefaults['taskDefaults']
): TaskRecord {
  const now = new Date().toISOString()
  
  return {
    id: '', // Will be set by API
    title: overrides.title || 'New Task',
    description: overrides.description || '',
    status: overrides.status || smartDefaults.status || 'todo',
    priority: overrides.priority || smartDefaults.priority || 'medium',
    assignedTo: overrides.assignedTo || smartDefaults.assignedTo || [],
    clientId: overrides.clientId || smartDefaults.clientId || null,
    client: overrides.client || smartDefaults.client || null,
    projectId: overrides.projectId || smartDefaults.projectId || null,
    projectName: overrides.projectName || smartDefaults.projectName || null,
    dueDate: overrides.dueDate || smartDefaults.dueDate || null,
    tags: overrides.tags || smartDefaults.tags || [],
    createdAt: now,
    updatedAt: now,
  }
}
