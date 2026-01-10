'use client'

import { useCallback, useEffect, useState } from 'react'
import { Calendar as CalendarIcon, LoaderCircle, Plus, Tag, X, CircleAlert } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'

import { apiFetch } from '@/lib/api-client'
import { emitDashboardRefresh } from '@/lib/refresh-bus'
import { useAuth } from '@/contexts/auth-context'
import { useClientContext } from '@/contexts/client-context'
import { useToast } from '@/components/ui/use-toast'
import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

type EditProjectDialogProps = {
  project: ProjectRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectUpdated?: (project: ProjectRecord) => void
}

type UpdateProjectPayload = {
  name?: string
  description?: string | null
  status?: ProjectStatus
  clientId?: string | null
  clientName?: string | null
  startDate?: string | null
  endDate?: string | null
  tags?: string[]
}

export function EditProjectDialog({ project, open, onOpenChange, onProjectUpdated }: EditProjectDialogProps) {
  const { user } = useAuth()
  const { clients } = useClientContext()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('planning')
  const [clientId, setClientId] = useState<string>('')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Initialize form when project changes
  useEffect(() => {
    if (project && open) {
      setName(project.name)
      setDescription(project.description ?? '')
      setStatus(project.status)
      setClientId(project.clientId ?? 'none')
      setStartDate(project.startDate ? parseISO(project.startDate) : undefined)
      setEndDate(project.endDate ? parseISO(project.endDate) : undefined)
      setTags(project.tags ?? [])
      setTagInput('')
      setError(null)
      setValidationErrors({})
      setHasChanges(false)
    }
  }, [project, open])

  // Track changes
  useEffect(() => {
    if (!project) return

    const changed =
      name !== project.name ||
      description !== (project.description ?? '') ||
      status !== project.status ||
      clientId !== (project.clientId ?? 'none') ||
      (startDate ? format(startDate, 'yyyy-MM-dd') : '') !== (project.startDate?.split('T')[0] ?? '') ||
      (endDate ? format(endDate, 'yyyy-MM-dd') : '') !== (project.endDate?.split('T')[0] ?? '') ||
      JSON.stringify(tags) !== JSON.stringify(project.tags ?? [])

    setHasChanges(changed)
  }, [project, name, description, status, clientId, startDate, endDate, tags])

  const validate = useCallback((): boolean => {
    const errors: Record<string, string> = {}

    if (!name.trim()) {
      errors.name = 'Project name is required'
    } else if (name.trim().length > 200) {
      errors.name = 'Project name must be 200 characters or less'
    }

    if (description.length > 2000) {
      errors.description = 'Description must be 2000 characters or less'
    }

    if (startDate && endDate) {
      if (endDate < startDate) {
        errors.endDate = 'End date cannot be before start date'
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [name, description, startDate, endDate])

  const handleAddTag = useCallback(() => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags((prev) => [...prev, trimmed])
      setTagInput('')
    }
  }, [tagInput, tags])

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }, [])

  const handleTagKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddTag()
    }
  }, [handleAddTag])

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()

    if (!user?.id || !project) {
      toast({ title: 'Authentication required', description: 'Please sign in to update the project.', variant: 'destructive' })
      return
    }

    if (!validate()) {
      return
    }

    if (!hasChanges) {
      onOpenChange(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const selectedClientData = clients.find((c) => c.id === clientId)

      const payload: UpdateProjectPayload = {}

      if (name.trim() !== project.name) {
        payload.name = name.trim()
      }
      if (description.trim() !== (project.description ?? '')) {
        payload.description = description.trim() || null
      }
      if (status !== project.status) {
        payload.status = status
      }
      if (clientId !== (project.clientId ?? 'none')) {
        payload.clientId = (clientId && clientId !== 'none') ? clientId : null
        payload.clientName = selectedClientData?.name || null
      }
      if ((startDate ? format(startDate, 'yyyy-MM-dd') : '') !== (project.startDate?.split('T')[0] ?? '')) {
        payload.startDate = startDate ? format(startDate, 'yyyy-MM-dd') : null
      }
      if ((endDate ? format(endDate, 'yyyy-MM-dd') : '') !== (project.endDate?.split('T')[0] ?? '')) {
        payload.endDate = endDate ? format(endDate, 'yyyy-MM-dd') : null
      }
      if (JSON.stringify(tags) !== JSON.stringify(project.tags ?? [])) {
        payload.tags = tags
      }

      const updatedProject = await apiFetch<ProjectRecord>(`/api/projects/${project.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      })

      toast({
        title: 'Project updated!',
        description: `"${updatedProject.name}" has been saved.`,
      })

      onProjectUpdated?.(updatedProject)
      emitDashboardRefresh({ reason: 'project-mutated', clientId: updatedProject.clientId ?? null })
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update project'
      setError(message)
      toast({ title: 'Update failed', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [user?.id, project, name, description, status, clientId, clients, startDate, endDate, tags, hasChanges, validate, toast, onProjectUpdated, onOpenChange])

  const formatStatusLabel = (value: ProjectStatus): string => {
    return value
      .replace('_', ' ')
      .split(' ')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ')
  }

  const handleClose = useCallback(() => {
    if (hasChanges && !loading) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?')
      if (!confirmed) return
    }
    onOpenChange(false)
  }, [hasChanges, loading, onOpenChange])

  if (!project) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit project</DialogTitle>
            <DialogDescription>
              Update project details. Changes will be saved when you click Save.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <CircleAlert className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 space-y-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-project-name">
                Project name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-project-name"
                placeholder="e.g., Q1 Marketing Campaign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoFocus
                aria-invalid={!!validationErrors.name}
                aria-describedby={validationErrors.name ? 'name-error' : undefined}
              />
              {validationErrors.name && (
                <p id="name-error" className="text-xs text-destructive">{validationErrors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-project-description">
                Description
                <span className="ml-2 text-xs text-muted-foreground">({description.length}/2000)</span>
              </Label>
              <Textarea
                id="edit-project-description"
                placeholder="Brief overview of the project goals and scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
                aria-invalid={!!validationErrors.description}
              />
              {validationErrors.description && (
                <p className="text-xs text-destructive">{validationErrors.description}</p>
              )}
            </div>

            {/* Status and Client */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-project-status">Status</Label>
                <Select value={status} onValueChange={(value: ProjectStatus) => setStatus(value)} disabled={loading}>
                  <SelectTrigger id="edit-project-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {formatStatusLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-project-client">Client / Workspace</Label>
                <Select value={clientId} onValueChange={setClientId} disabled={loading}>
                  <SelectTrigger id="edit-project-client">
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      disabled={(date: Date) => date < new Date('1900-01-01')}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground',
                        validationErrors.endDate && 'border-destructive text-destructive'
                      )}
                      disabled={loading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date: Date) =>
                        (startDate ? date < startDate : false) || date < new Date('1900-01-01')
                      }
                    />
                  </PopoverContent>
                </Popover>
                {validationErrors.endDate && (
                  <p className="text-xs text-destructive">{validationErrors.endDate}</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="edit-project-tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-project-tags"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  disabled={loading || tags.length >= 10}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleAddTag}
                  disabled={loading || !tagInput.trim() || tags.length >= 10}
                  aria-label="Add tag"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                        disabled={loading}
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {tags.length}/10 tags. Press Enter or click + to add.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim() || !hasChanges}>
              {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {hasChanges ? 'Save changes' : 'No changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
