'use client'

import { useCallback, useState, type FormEvent } from 'react'
import { TaskRecord, TaskStatus, TaskPriority } from '@/types/tasks'
import { TaskFormState, buildInitialFormState } from '../task-types'
import type { CreateTaskPayload, UpdateTaskPayload } from './use-tasks'

export type UseTaskFormOptions = {
  selectedClient: { id: string | null; name: string | null } | null
  selectedClientId: string | undefined
  userId: string | undefined
  onCreateTask: (payload: CreateTaskPayload) => Promise<TaskRecord | null>
  onUpdateTask: (taskId: string, payload: UpdateTaskPayload) => Promise<TaskRecord | null>
}

export type UseTaskFormReturn = {
  // Create form
  isCreateOpen: boolean
  formState: TaskFormState
  setFormState: React.Dispatch<React.SetStateAction<TaskFormState>>
  creating: boolean
  createError: string | null
  handleCreateOpenChange: (open: boolean) => void
  handleCreateSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>

  // Edit form
  isEditOpen: boolean
  editingTask: TaskRecord | null
  editFormState: TaskFormState
  setEditFormState: React.Dispatch<React.SetStateAction<TaskFormState>>
  updating: boolean
  updateError: string | null
  handleEditOpen: (task: TaskRecord) => void
  handleEditClose: () => void
  handleEditSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>

  // Delete dialog
  isDeleteDialogOpen: boolean
  deletingTask: TaskRecord | null
  deleting: boolean
  handleDeleteClick: (task: TaskRecord) => void
  handleDeleteClose: () => void
  setDeleting: React.Dispatch<React.SetStateAction<boolean>>
}

export function useTaskForm({
  selectedClient,
  selectedClientId,
  userId,
  onCreateTask,
  onUpdateTask,
}: UseTaskFormOptions): UseTaskFormReturn {
  // Create form state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formState, setFormState] = useState<TaskFormState>(() =>
    buildInitialFormState(selectedClient ?? undefined)
  )
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Edit form state
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editFormState, setEditFormState] = useState<TaskFormState>(() => buildInitialFormState())
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  // Delete dialog state
  const [deletingTask, setDeletingTask] = useState<TaskRecord | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const resetForm = useCallback(() => {
    setFormState(buildInitialFormState(selectedClient ?? undefined))
    setCreateError(null)
  }, [selectedClient])

  const handleCreateOpenChange = useCallback(
    (open: boolean) => {
      setIsCreateOpen(open)
      if (open) {
        setCreateError(null)
        setFormState((prev) => ({
          ...prev,
          clientId: selectedClient?.id ?? null,
          clientName: selectedClient?.name ?? '',
        }))
      } else {
        resetForm()
      }
    },
    [resetForm, selectedClient]
  )

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!userId) {
      setCreateError('You must be signed in to create tasks.')
      return
    }

    if (!selectedClientId) {
      setCreateError('Select a client from the dashboard before creating tasks.')
      return
    }

    const trimmedTitle = formState.title.trim()
    if (!trimmedTitle) {
      setCreateError('Title is required.')
      return
    }

    setCreating(true)
    setCreateError(null)

    const assignedMembers = formState.assignedTo
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0)

    const normalizedTags = formState.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const normalizedClientName = (selectedClient?.name ?? formState.clientName).trim()

    const payload: CreateTaskPayload = {
      title: trimmedTitle,
      description: formState.description.trim() || undefined,
      status: formState.status,
      priority: formState.priority,
      assignedTo: assignedMembers,
      clientId: selectedClientId,
      client: normalizedClientName || undefined,
      dueDate: formState.dueDate || undefined,
      tags: normalizedTags,
    }

    try {
      await onCreateTask(payload)
      handleCreateOpenChange(false)
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Unexpected error creating task')
    } finally {
      setCreating(false)
    }
  }

  const handleEditOpen = useCallback((task: TaskRecord) => {
    setEditingTask(task)
    setEditFormState({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      assignedTo: (task.assignedTo ?? []).join(', '),
      clientId: task.clientId || null,
      clientName: task.client || '',
      dueDate: task.dueDate || '',
      tags: (task.tags ?? []).join(', '),
    })
    setUpdateError(null)
    setIsEditOpen(true)
  }, [])

  const handleEditClose = useCallback(() => {
    setIsEditOpen(false)
    setEditingTask(null)
    setEditFormState(buildInitialFormState())
    setUpdateError(null)
  }, [])

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingTask) return

    const trimmedTitle = editFormState.title.trim()
    if (!trimmedTitle) {
      setUpdateError('Title is required.')
      return
    }

    setUpdating(true)
    setUpdateError(null)

    const assignedMembers = editFormState.assignedTo
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0)

    const normalizedTags = editFormState.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)

    const payload: UpdateTaskPayload = {
      title: trimmedTitle,
      description: editFormState.description.trim() || undefined,
      status: editFormState.status,
      priority: editFormState.priority,
      assignedTo: assignedMembers,
      dueDate: editFormState.dueDate || undefined,
      tags: normalizedTags,
    }

    try {
      await onUpdateTask(editingTask.id, payload)
      handleEditClose()
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Unexpected error updating task')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteClick = useCallback((task: TaskRecord) => {
    setDeletingTask(task)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleDeleteClose = useCallback(() => {
    setIsDeleteDialogOpen(false)
    setDeletingTask(null)
  }, [])

  return {
    // Create
    isCreateOpen,
    formState,
    setFormState,
    creating,
    createError,
    handleCreateOpenChange,
    handleCreateSubmit,

    // Edit
    isEditOpen,
    editingTask,
    editFormState,
    setEditFormState,
    updating,
    updateError,
    handleEditOpen,
    handleEditClose,
    handleEditSubmit,

    // Delete
    isDeleteDialogOpen,
    deletingTask,
    deleting,
    handleDeleteClick,
    handleDeleteClose,
    setDeleting,
  }
}
