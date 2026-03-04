'use client'

import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { useMutation } from 'convex/react'
import { Calendar as CalendarIcon, LoaderCircle, Plus, Tag, X, CircleAlert } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'

import { projectsApi } from '@/lib/convex-api'
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

type EditProjectState = {
  loading: boolean
  error: string | null
  name: string
  description: string
  status: ProjectStatus
  clientId: string
  startDate: Date | undefined
  endDate: Date | undefined
  tags: string[]
  tagInput: string
  validationErrors: Record<string, string>
}

type EditProjectAction =
  | { type: 'initFromProject'; project: ProjectRecord }
  | { type: 'setLoading'; value: boolean }
  | { type: 'setError'; value: string | null }
  | { type: 'setName'; value: string }
  | { type: 'setDescription'; value: string }
  | { type: 'setStatus'; value: ProjectStatus }
  | { type: 'setClientId'; value: string }
  | { type: 'setStartDate'; value: Date | undefined }
  | { type: 'setEndDate'; value: Date | undefined }
  | { type: 'setTagInput'; value: string }
  | { type: 'addTag'; value: string }
  | { type: 'removeTag'; value: string }
  | { type: 'setValidationErrors'; value: Record<string, string> }

const INITIAL_EDIT_PROJECT_STATE: EditProjectState = {
  loading: false,
  error: null,
  name: '',
  description: '',
  status: 'planning',
  clientId: 'none',
  startDate: undefined,
  endDate: undefined,
  tags: [],
  tagInput: '',
  validationErrors: {},
}

function parseProjectDate(value: string | null): Date | undefined {
  if (!value) return undefined
  const parsed = parseISO(value)
  return isValid(parsed) ? parsed : undefined
}

function editProjectReducer(state: EditProjectState, action: EditProjectAction): EditProjectState {
  switch (action.type) {
    case 'initFromProject':
      return {
        ...state,
        name: action.project.name,
        description: action.project.description ?? '',
        status: action.project.status,
        clientId: action.project.clientId ?? 'none',
        startDate: parseProjectDate(action.project.startDate),
        endDate: parseProjectDate(action.project.endDate),
        tags: action.project.tags ?? [],
        tagInput: '',
        error: null,
        validationErrors: {},
      }
    case 'setLoading':
      return { ...state, loading: action.value }
    case 'setError':
      return { ...state, error: action.value }
    case 'setName':
      return { ...state, name: action.value }
    case 'setDescription':
      return { ...state, description: action.value }
    case 'setStatus':
      return { ...state, status: action.value }
    case 'setClientId':
      return { ...state, clientId: action.value }
    case 'setStartDate':
      return { ...state, startDate: action.value }
    case 'setEndDate':
      return { ...state, endDate: action.value }
    case 'setTagInput':
      return { ...state, tagInput: action.value }
    case 'addTag':
      return { ...state, tags: [...state.tags, action.value], tagInput: '' }
    case 'removeTag':
      return { ...state, tags: state.tags.filter((tag) => tag !== action.value) }
    case 'setValidationErrors':
      return { ...state, validationErrors: action.value }
    default:
      return state
  }
}

type EditProjectFormFieldsProps = {
  loading: boolean
  name: string
  description: string
  status: ProjectStatus
  clientId: string
  startDate: Date | undefined
  endDate: Date | undefined
  tags: string[]
  tagInput: string
  validationErrors: Record<string, string>
  clients: Array<{ id: string; name: string }>
  onDispatch: React.Dispatch<EditProjectAction>
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
  onTagKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  formatStatusLabel: (value: ProjectStatus) => string
}

function EditProjectFormFields({
  loading,
  name,
  description,
  status,
  clientId,
  startDate,
  endDate,
  tags,
  tagInput,
  validationErrors,
  clients,
  onDispatch,
  onAddTag,
  onRemoveTag,
  onTagKeyDown,
  formatStatusLabel,
}: EditProjectFormFieldsProps) {
  return (
    <div className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-project-name">
          Project name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="edit-project-name"
          placeholder="e.g., Q1 Marketing Campaign"
          value={name}
          onChange={(e) => onDispatch({ type: 'setName', value: e.target.value })}
          disabled={loading}
          aria-invalid={!!validationErrors.name}
          aria-describedby={validationErrors.name ? 'name-error' : undefined}
        />
        {validationErrors.name && (
          <p id="name-error" className="text-xs text-destructive">{validationErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-project-description">
          Description
          <span className="ml-2 text-xs text-muted-foreground">({description.length}/2000)</span>
        </Label>
        <Textarea
          id="edit-project-description"
          placeholder="Brief overview of the project goals and scope..."
          value={description}
          onChange={(e) => onDispatch({ type: 'setDescription', value: e.target.value })}
          disabled={loading}
          rows={3}
          aria-invalid={!!validationErrors.description}
        />
        {validationErrors.description && (
          <p className="text-xs text-destructive">{validationErrors.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-project-status">Status</Label>
          <Select
            value={status}
            onValueChange={(value: ProjectStatus) => onDispatch({ type: 'setStatus', value })}
            disabled={loading}
          >
            <SelectTrigger id="edit-project-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((optionStatus) => (
                <SelectItem key={optionStatus} value={optionStatus}>
                  {formatStatusLabel(optionStatus)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-project-client">Client / Workspace</Label>
          <Select
            value={clientId}
            onValueChange={(value) => onDispatch({ type: 'setClientId', value })}
            disabled={loading}
          >
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
                onSelect={(value) => onDispatch({ type: 'setStartDate', value })}
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
                onSelect={(value) => onDispatch({ type: 'setEndDate', value })}
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

      <div className="space-y-2">
        <Label htmlFor="edit-project-tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="edit-project-tags"
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => onDispatch({ type: 'setTagInput', value: e.target.value })}
            onKeyDown={onTagKeyDown}
            disabled={loading || tags.length >= 10}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAddTag}
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
                  onClick={() => onRemoveTag(tag)}
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
  )
}

export function EditProjectDialog({ project, open, onOpenChange, onProjectUpdated }: EditProjectDialogProps) {
  const { user } = useAuth()
  const workspaceId = user?.agencyId ?? null

  const updateProject = useMutation(projectsApi.update)
  const { clients } = useClientContext()
  const { toast } = useToast()

  const [state, dispatch] = useReducer(editProjectReducer, INITIAL_EDIT_PROJECT_STATE)
  const {
    loading,
    error,
    name,
    description,
    status,
    clientId,
    startDate,
    endDate,
    tags,
    tagInput,
    validationErrors,
  } = state

  // Initialize form when project changes
  useEffect(() => {
    if (!project || !open) return

    const frame = requestAnimationFrame(() => {
      dispatch({ type: 'initFromProject', project })
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [project, open])

  const hasChanges = useMemo(() => {
    if (!project) return false

    return (
      name !== project.name ||
      description !== (project.description ?? '') ||
      status !== project.status ||
      clientId !== (project.clientId ?? 'none') ||
      (startDate ? format(startDate, 'yyyy-MM-dd') : '') !== (project.startDate?.split('T')[0] ?? '') ||
      (endDate ? format(endDate, 'yyyy-MM-dd') : '') !== (project.endDate?.split('T')[0] ?? '') ||
      JSON.stringify(tags) !== JSON.stringify(project.tags ?? [])
    )
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

    dispatch({ type: 'setValidationErrors', value: errors })
    return Object.keys(errors).length === 0
  }, [name, description, startDate, endDate])

  const handleAddTag = useCallback(() => {
    const trimmed = tagInput.trim()
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      dispatch({ type: 'addTag', value: trimmed })
    }
  }, [tagInput, tags])

  const handleRemoveTag = useCallback((tag: string) => {
    dispatch({ type: 'removeTag', value: tag })
  }, [])

  const handleTagKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddTag()
    }
  }, [handleAddTag])

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault()

    if (!user?.id || !workspaceId || !project) {
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

    dispatch({ type: 'setLoading', value: true })
    dispatch({ type: 'setError', value: null })

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

    void updateProject({
        workspaceId,
        legacyId: project.id,
        ...('name' in payload ? { name: payload.name } : {}),
        ...('description' in payload ? { description: payload.description ?? null } : {}),
        ...('status' in payload ? { status: payload.status } : {}),
        ...('clientId' in payload ? { clientId: payload.clientId ?? null } : {}),
        ...('clientName' in payload ? { clientName: payload.clientName ?? null } : {}),
        ...('startDate' in payload ? { startDateMs: payload.startDate ? new Date(payload.startDate).getTime() : null } : {}),
        ...('endDate' in payload ? { endDateMs: payload.endDate ? new Date(payload.endDate).getTime() : null } : {}),
        ...('tags' in payload ? { tags: payload.tags ?? [] } : {}),
        updatedAtMs: Date.now(),
      })

      .then(() => {
        const updatedProject: ProjectRecord = {
          ...project,
          ...('name' in payload ? { name: payload.name ?? project.name } : {}),
          ...('description' in payload ? { description: payload.description ?? null } : {}),
          ...('status' in payload ? { status: (payload.status ?? project.status) as ProjectStatus } : {}),
          ...('clientId' in payload ? { clientId: payload.clientId ?? null } : {}),
          ...('clientName' in payload ? { clientName: payload.clientName ?? null } : {}),
          ...('startDate' in payload ? { startDate: payload.startDate ?? null } : {}),
          ...('endDate' in payload ? { endDate: payload.endDate ?? null } : {}),
          ...('tags' in payload ? { tags: payload.tags ?? [] } : {}),
          updatedAt: new Date().toISOString(),
        }

        toast({
          title: 'Project updated!',
          description: `"${updatedProject.name}" has been saved.`,
        })

        onProjectUpdated?.(updatedProject)
        emitDashboardRefresh({ reason: 'project-mutated', clientId: updatedProject.clientId ?? null })
        onOpenChange(false)
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Failed to update project'
        dispatch({ type: 'setError', value: message })
        toast({ title: 'Update failed', description: message, variant: 'destructive' })
      })
      .finally(() => {
        dispatch({ type: 'setLoading', value: false })
      })
  }, [user?.id, workspaceId, project, name, description, status, clientId, clients, startDate, endDate, tags, hasChanges, validate, toast, onProjectUpdated, onOpenChange, updateProject])

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

          <EditProjectFormFields
            loading={loading}
            name={name}
            description={description}
            status={status}
            clientId={clientId}
            startDate={startDate}
            endDate={endDate}
            tags={tags}
            tagInput={tagInput}
            validationErrors={validationErrors}
            clients={clients}
            onDispatch={dispatch}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            onTagKeyDown={handleTagKeyDown}
            formatStatusLabel={formatStatusLabel}
          />

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
