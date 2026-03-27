'use client'

import { useCallback, useState, type FormEvent } from 'react'
import { useConvex, useMutation } from 'convex/react'
import type { TaskRecord } from '@/types/tasks'
import { asErrorMessage } from '@/lib/convex-errors'
import { filesApi } from '@/lib/convex-api'
import {
  buildPendingTaskAttachments,
  type PendingTaskAttachment,
  uploadTaskAttachment,
} from '@/services/task-attachments'
import { buildInitialFormState, isFutureTaskDueDateValue, parseMentionNames } from '../task-types'
import type { TaskFormState } from '../task-types'
import type { CreateTaskPayload, UpdateTaskPayload } from './use-tasks'

export type UseTaskFormOptions = {
  selectedClient: { id: string | null; name: string | null } | null
  selectedClientId: string | undefined
  projectContext?: { id: string | null; name: string | null }
  userId: string | undefined
  initialCreateOpen?: boolean
  onCreateOpenChange?: (open: boolean) => void
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
  createAttachments: PendingTaskAttachment[]
  handleCreateAttachmentsAdd: (files: FileList | null) => void
  handleCreateAttachmentRemove: (attachmentId: string) => void

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
  projectContext,
  userId,
  initialCreateOpen = false,
  onCreateOpenChange,
  onCreateTask,
  onUpdateTask,
}: UseTaskFormOptions): UseTaskFormReturn {
  const convex = useConvex()
  // Create form state
  const [isCreateOpen, setIsCreateOpen] = useState(initialCreateOpen)
  const [formState, setFormState] = useState<TaskFormState>(() =>
    buildInitialFormState(selectedClient ?? undefined, projectContext)
  )
  const [createAttachments, setCreateAttachments] = useState<PendingTaskAttachment[]>([])
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)
  const getPublicUrl = useCallback(
    (args: { storageId: string }) => convex.query(filesApi.getPublicUrl, args),
    [convex]
  )

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
    setFormState(buildInitialFormState(selectedClient ?? undefined, projectContext))
    setCreateAttachments([])
    setCreateError(null)
  }, [projectContext, selectedClient])

  const handleCreateAttachmentsAdd = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const next = buildPendingTaskAttachments(files)
    setCreateAttachments((prev) => [...prev, ...next].slice(0, 10))
  }, [])

  const handleCreateAttachmentRemove = useCallback((attachmentId: string) => {
    setCreateAttachments((prev) => prev.filter((item) => item.id !== attachmentId))
  }, [])

  const handleCreateOpenChange = useCallback(
    (open: boolean) => {
      setIsCreateOpen(open)
      onCreateOpenChange?.(open)
      if (open) {
        setCreateError(null)
        setFormState((prev) => ({
          ...prev,
          clientId: selectedClient?.id ?? null,
          clientName: selectedClient?.name ?? '',
          projectId: projectContext?.id ?? null,
          projectName: projectContext?.name ?? '',
        }))
      } else {
        resetForm()
      }
    },
    [onCreateOpenChange, projectContext, resetForm, selectedClient]
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

    if (formState.dueDate && !isFutureTaskDueDateValue(formState.dueDate)) {
      setCreateError('Due date must be today or later.')
      return
    }

    setCreating(true)
    setCreateError(null)

    const assignedMembers = parseMentionNames(formState.assignedTo)

    const normalizedClientName = (selectedClient?.name ?? formState.clientName).trim()
    const normalizedProjectName = formState.projectName.trim()

    const payload: CreateTaskPayload = {
      title: trimmedTitle,
      description: formState.description.trim() || undefined,
      status: formState.status,
      priority: formState.priority,
      assignedTo: assignedMembers,
      clientId: selectedClientId,
      client: normalizedClientName || undefined,
      projectId: formState.projectId ?? undefined,
      projectName: normalizedProjectName || undefined,
      dueDate: formState.dueDate || undefined,
      attachments: [],
    }

    try {
      if (createAttachments.length > 0) {
        const uploadedAttachments = await Promise.all(
          createAttachments.map((attachment) =>
            uploadTaskAttachment({
              userId,
              file: attachment.file,
              generateUploadUrl,
              getPublicUrl,
            })
          )
        )

        payload.attachments = uploadedAttachments
      }

      await onCreateTask(payload)
      handleCreateOpenChange(false)
    } catch (err) {
      setCreateError(asErrorMessage(err))
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
      assignedTo: (task.assignedTo ?? []).map((name) => `@[${name}]`).join(' '),
      clientId: task.clientId || null,
      clientName: task.client || '',
      projectId: task.projectId || null,
      projectName: task.projectName || '',
      dueDate: task.dueDate || '',
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

    if (editFormState.dueDate && !isFutureTaskDueDateValue(editFormState.dueDate)) {
      setUpdateError('Due date must be today or later.')
      return
    }

    setUpdating(true)
    setUpdateError(null)

    const assignedMembers = parseMentionNames(editFormState.assignedTo)

    const payload: UpdateTaskPayload = {
      title: trimmedTitle,
      description: editFormState.description.trim() || undefined,
      status: editFormState.status,
      priority: editFormState.priority,
      assignedTo: assignedMembers,
      dueDate: editFormState.dueDate || undefined,
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
    createAttachments,
    handleCreateAttachmentsAdd,
    handleCreateAttachmentRemove,

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
