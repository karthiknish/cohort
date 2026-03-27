'use client'

import { useRef, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { useSmartDefaults } from '@/shared/hooks/use-smart-defaults'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { useToast } from '@/shared/ui/use-toast'
import type { TaskRecord } from '@/types/tasks'
import { emitDashboardRefresh } from '@/lib/refresh-bus'
import { useConvex, useMutation } from 'convex/react'
import { filesApi, tasksApi } from '@/lib/convex-api'
import {
  buildPendingTaskAttachments,
  type PendingTaskAttachment,
  uploadTaskAttachment,
} from '@/services/task-attachments'
import { TaskCreationModalFormFields } from './task-creation-modal-form'
import { isFutureTaskDueDateValue } from './task-types'

interface TaskCreationModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: {
    title?: string
    description?: string
    projectId?: string
    projectName?: string
  }
  onTaskCreated?: (task: TaskRecord) => void
}

export function TaskCreationModal({
  isOpen,
  onClose,
  initialData,
  onTaskCreated,
}: TaskCreationModalProps) {
  const { user } = useAuth()
  const { selectedClientId, selectedClient } = useClientContext()
  const { toast } = useToast()
  const { taskDefaults, contextInfo } = useSmartDefaults()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const convex = useConvex()
  const defaultDueDate = taskDefaults.dueDate && isFutureTaskDueDateValue(taskDefaults.dueDate)
    ? taskDefaults.dueDate
    : ''

  const createTask = useMutation(tasksApi.createTask)
  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingAttachments, setPendingAttachments] = useState<PendingTaskAttachment[]>([])

  // Form state with smart defaults
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: taskDefaults.priority || 'medium',
    dueDate: defaultDueDate,
    assignedTo: taskDefaults.assignedTo || [],
    projectId: initialData?.projectId || taskDefaults.projectId || '',
    projectName: initialData?.projectName || taskDefaults.projectName || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    if (formData.dueDate && !isFutureTaskDueDateValue(formData.dueDate)) {
      setError('Due date must be today or later.')
      return
    }

    if (!user?.id) {
      setError('You must be signed in to create tasks.')
      return
    }

    setIsLoading(true)
    setError(null)

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      status: 'todo' as const,
      dueDate: formData.dueDate || undefined,
      assignedTo: formData.assignedTo,
      clientId: selectedClientId || undefined,
      client: selectedClient?.name || undefined,
      projectId: formData.projectId || undefined,
      projectName: formData.projectName || undefined,
    }

    if (!user?.agencyId) {
      setError('Workspace context missing')
      setIsLoading(false)
      return
    }

    const attachmentsPromise =
      pendingAttachments.length > 0
        ? Promise.all(
            pendingAttachments.map((attachment) =>
              uploadTaskAttachment({
                userId: user.id,
                file: attachment.file,
                generateUploadUrl,
                getPublicUrl: (args) => convex.query(filesApi.getPublicUrl, args),
              })
            )
          )
        : Promise.resolve([])

    void attachmentsPromise
      .then((attachments) => {
        return createTask({
          workspaceId: user.agencyId,
          title: payload.title,
          description: payload.description ?? null,
          status: payload.status,
          priority: payload.priority,
          assignedTo: payload.assignedTo,
          clientId: payload.clientId ?? '',
          client: payload.client ?? null,
          projectId: payload.projectId ?? null,
          projectName: payload.projectName ?? null,
          dueDateMs: payload.dueDate ? Date.parse(payload.dueDate) : null,
          attachments,
        }).then((result) => ({ attachments, result }))
      })
      .then(({ attachments, result }) => {
        const legacyId = typeof result === 'string' ? result : result?.legacyId

        if (!legacyId) {
          const message = 'Failed to create task'
          setError(message)
          toast({
            title: 'Failed to create task',
            description: message,
            variant: 'destructive',
          })
          return
        }

        const createdTask: TaskRecord = {
          id: legacyId,
          title: payload.title,
          description: payload.description ?? null,
          status: payload.status,
          priority: payload.priority as TaskRecord['priority'],
          assignedTo: payload.assignedTo,
          clientId: payload.clientId ?? null,
          client: payload.client ?? null,
          projectId: payload.projectId ?? null,
          projectName: payload.projectName ?? null,
          dueDate: payload.dueDate ?? null,
          attachments,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        }

        toast({
          title: 'Task created!',
          description: `"${createdTask.title}" has been added and is ready to track.`,
        })

        onTaskCreated?.(createdTask)
        emitDashboardRefresh({ reason: 'task-mutated', clientId: createdTask.clientId ?? selectedClientId ?? null })
        onClose()

        setFormData({
          title: '',
          description: '',
          priority: taskDefaults.priority || 'medium',
          dueDate: defaultDueDate,
          assignedTo: taskDefaults.assignedTo || [],
          projectId: taskDefaults.projectId || '',
          projectName: taskDefaults.projectName || '',
        })
        setPendingAttachments([])
      })
      .catch((err) => {
        console.error('Failed to create task:', err)
        const message = err instanceof Error ? err.message : 'Unexpected error creating task'
        setError(message)
        toast({
          title: 'Failed to create task',
          description: message,
          variant: 'destructive',
        })
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const handleAddAttachments = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const next = buildPendingTaskAttachments(files)
    setPendingAttachments((prev) => [...prev, ...next].slice(0, 10))
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    setPendingAttachments((prev) => prev.filter((item) => item.id !== attachmentId))
  }

  const handleDateSelect = (date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      dueDate: date ? format(date, 'yyyy-MM-dd') : '',
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Create Task
          </DialogTitle>
          <DialogDescription>
            {contextInfo.isAutoPopulated && (
              <span className="text-xs text-success">
                Auto-populated from current context
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TaskCreationModalFormFields
            title={formData.title}
            description={formData.description}
            priority={formData.priority}
            dueDate={formData.dueDate}
            projectName={formData.projectName}
            clientName={contextInfo.clientName}
            assigneeCount={formData.assignedTo.length}
            error={error}
            isLoading={isLoading}
            pendingAttachments={pendingAttachments}
            fileInputRef={fileInputRef}
            onTitleChange={(value) => setFormData((prev) => ({ ...prev, title: value }))}
            onDescriptionChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
            onPriorityChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
            onDateSelect={handleDateSelect}
            onAddAttachments={handleAddAttachments}
            onRemoveAttachment={handleRemoveAttachment}
            onCancel={onClose}
          />
        </form>
      </DialogContent>
    </Dialog>
  )
}
