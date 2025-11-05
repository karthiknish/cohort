'use client'

import { useState } from 'react'
import { Calendar, Users, Flag, MessageSquare, X } from 'lucide-react'

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
import { useSmartDefaults, createTaskWithDefaults } from '@/hooks/use-smart-defaults'
import { useAuth } from '@/contexts/auth-context'
import type { TaskRecord } from '@/types/tasks'

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
  const { taskDefaults, contextInfo } = useSmartDefaults()
  const [isLoading, setIsLoading] = useState(false)
  
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

    setIsLoading(true)
    try {
      // Create task with smart defaults
      const taskOverrides = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority as any,
        dueDate: formData.dueDate || null,
        assignedTo: formData.assignedTo,
        projectId: formData.projectId || null,
        projectName: formData.projectName || null,
      }

      const newTask = createTaskWithDefaults(taskOverrides, taskDefaults)
      
      // TODO: Save task to API
      console.log('Creating task:', newTask)
      
      onTaskCreated?.(newTask)
      onClose()
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: taskDefaults.priority || 'medium',
        dueDate: taskDefaults.dueDate || '',
        assignedTo: taskDefaults.assignedTo || [],
        projectId: taskDefaults.projectId || '',
        projectName: taskDefaults.projectName || '',
      })
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDueDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toISOString().split('T')[0]
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
              <Input
                id="dueDate"
                type="date"
                value={formatDueDate(formData.dueDate)}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
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
