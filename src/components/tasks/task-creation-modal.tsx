'use client'

import { useRef, useState } from 'react'
import { MessageSquare, Calendar as CalendarIcon, Paperclip } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { PendingAttachmentsList } from '@/app/dashboard/collaboration/components/message-composer'
import { cn } from '@/lib/utils'
import { useSmartDefaults } from '@/hooks/use-smart-defaults'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { useToast } from '@/components/ui/use-toast'
import type { TaskRecord } from '@/types/tasks'
import { emitDashboardRefresh } from '@/lib/refresh-bus'
import { useMutation } from 'convex/react'
import { filesApi, tasksApi } from '@/lib/convex-api'
import {
  buildPendingTaskAttachments,
  type PendingTaskAttachment,
  uploadTaskAttachment,
} from '@/services/task-attachments'

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

  const createTask = useMutation(tasksApi.createTask)
  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)
  const getPublicUrl = useMutation(filesApi.getPublicUrl)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingAttachments, setPendingAttachments] = useState<PendingTaskAttachment[]>([])

  // Form state with smart defaults
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: taskDefaults.priority || 'medium',
    dueDate: taskDefaults.dueDate || '',
    assignedTo: taskDefaults.assignedTo || [],
    projectId: initialData?.projectId || taskDefaults.projectId || '',
    projectName: initialData?.projectName || taskDefaults.projectName || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

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
      tags: [] as string[],
    }

    if (!user?.agencyId) {
      setError('Workspace context missing')
      setIsLoading(false)
      return
    }

    try {
      const attachments =
        pendingAttachments.length > 0
          ? await Promise.all(
              pendingAttachments.map((attachment) =>
                uploadTaskAttachment({
                  userId: user.id,
                  file: attachment.file,
                  generateUploadUrl,
                  getPublicUrl,
                })
              )
            )
          : []

      const result = await createTask({
        workspaceId: user.agencyId,
        title: payload.title,
        description: payload.description ?? null,
        status: payload.status,
        priority: payload.priority,
        assignedTo: payload.assignedTo,
        clientId: payload.clientId ?? '',
        client: payload.client ?? null,
        dueDateMs: payload.dueDate ? Date.parse(payload.dueDate) : null,
        tags: payload.tags,
        attachments,
      })

      const legacyId = typeof result === 'string' ? result : result?.legacyId

      if (!legacyId) {
        throw new Error('Failed to create task')
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
        tags: payload.tags,
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
        dueDate: taskDefaults.dueDate || '',
        assignedTo: taskDefaults.assignedTo || [],
        projectId: taskDefaults.projectId || '',
        projectName: taskDefaults.projectName || '',
      })
      setPendingAttachments([])
    } catch (err) {
      console.error('Failed to create task:', err)
      const message = err instanceof Error ? err.message : 'Unexpected error creating task'
      setError(message)
      toast({
        title: 'Failed to create task',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
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
    setFormData(prev => ({
      ...prev,
      dueDate: date ? format(date, 'yyyy-MM-dd') : ''
    }))
  }

  const getSelectedDate = () => {
    if (!formData.dueDate) return undefined
    const date = parseISO(formData.dueDate)
    return isValid(date) ? date : undefined
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
              <span className="text-xs text-green-600">
                Auto-populated from current context
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title..."
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? (
                      format(parseISO(formData.dueDate), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={getSelectedDate()}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {contextInfo.clientName || 'None'}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Project</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm">
                {formData.projectName || 'None'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assigned To</Label>
            <div className="px-3 py-2 bg-muted rounded-md text-sm">
              {formData.assignedTo.length > 0 ? `${formData.assignedTo.length} user(s)` : 'Unassigned'}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Attachments</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isLoading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
                Attach files
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => {
                handleAddAttachments(event.target.files)
                event.currentTarget.value = ''
              }}
            />

            {pendingAttachments.length > 0 ? (
              <PendingAttachmentsList
                attachments={pendingAttachments as any}
                uploading={isLoading}
                onRemove={handleRemoveAttachment}
              />
            ) : (
              <p className="text-xs text-muted-foreground">Add up to 10 files (max 15MB each).</p>
            )}
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.title.trim()}>
              {isLoading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
