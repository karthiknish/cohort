'use client'

import { useCallback, useReducer, useState } from 'react'
import { useMutation } from 'convex/react'
import { Calendar as CalendarIcon, LoaderCircle, Plus, Tag, X } from 'lucide-react'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

import { projectsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
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
  DialogTrigger,
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
import { cn } from '@/lib/utils'

type CreateProjectDialogProps = {
  onProjectCreated?: (project: ProjectRecord) => void
  trigger?: React.ReactNode
}

type CreateProjectPayload = {
  name: string
  description?: string
  status: ProjectStatus
  clientId?: string
  clientName?: string
  startDate?: string
  endDate?: string
  tags: string[]
}

type ProjectFormState = {
  name: string
  description: string
  status: ProjectStatus
  clientId: string
  startDate: Date | undefined
  endDate: Date | undefined
  tags: string[]
  tagInput: string
}

type ProjectFormAction =
  | { type: 'reset'; clientId: string }
  | { type: 'setName'; value: string }
  | { type: 'setDescription'; value: string }
  | { type: 'setStatus'; value: ProjectStatus }
  | { type: 'setClientId'; value: string }
  | { type: 'setStartDate'; value: Date | undefined }
  | { type: 'setEndDate'; value: Date | undefined }
  | { type: 'setTagInput'; value: string }
  | { type: 'addTag'; value: string }
  | { type: 'removeTag'; value: string }

function createInitialFormState(selectedClientId: string | null | undefined): ProjectFormState {
  return {
    name: '',
    description: '',
    status: 'planning',
    clientId: selectedClientId ?? '',
    startDate: undefined,
    endDate: undefined,
    tags: [],
    tagInput: '',
  }
}

function projectFormReducer(state: ProjectFormState, action: ProjectFormAction): ProjectFormState {
  switch (action.type) {
    case 'reset':
      return createInitialFormState(action.clientId)
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
    default:
      return state
  }
}

function formatStatusLabel(value: ProjectStatus): string {
  return value
    .replace('_', ' ')
    .split(' ')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

type CreateProjectFormFieldsProps = {
  loading: boolean
  clients: Array<{ id: string; name: string }>
  state: ProjectFormState
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onStatusChange: (value: ProjectStatus) => void
  onClientChange: (value: string) => void
  onStartDateChange: (value: Date | undefined) => void
  onEndDateChange: (value: Date | undefined) => void
  onTagInputChange: (value: string) => void
  onTagKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
}

function CreateProjectFormFields({
  loading,
  clients,
  state,
  onNameChange,
  onDescriptionChange,
  onStatusChange,
  onClientChange,
  onStartDateChange,
  onEndDateChange,
  onTagInputChange,
  onTagKeyDown,
  onAddTag,
  onRemoveTag,
}: CreateProjectFormFieldsProps) {
  return (
    <div className="mt-6 space-y-4">
      {/* Project Name */}
      <div className="space-y-2">
        <Label htmlFor="project-name">
          Project name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="project-name"
          placeholder="e.g., Q1 Marketing Campaign"
          value={state.name}
          onChange={(e) => onNameChange(e.target.value)}
          disabled={loading}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="project-description">Description</Label>
        <Textarea
          id="project-description"
          placeholder="Brief overview of the project goals and scope..."
          value={state.description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          disabled={loading}
          rows={3}
        />
      </div>

      {/* Status and Client */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="project-status">Status</Label>
          <Select value={state.status} onValueChange={(value: ProjectStatus) => onStatusChange(value)} disabled={loading}>
            <SelectTrigger id="project-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((statusValue) => (
                <SelectItem key={statusValue} value={statusValue}>
                  {formatStatusLabel(statusValue)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="project-client">Client / Workspace</Label>
          <Select value={state.clientId} onValueChange={onClientChange} disabled={loading}>
            <SelectTrigger id="project-client">
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
                  !state.startDate && 'text-muted-foreground'
                )}
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {state.startDate ? format(state.startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={state.startDate}
                onSelect={onStartDateChange}
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
                  !state.endDate && 'text-muted-foreground'
                )}
                disabled={loading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {state.endDate ? format(state.endDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={state.endDate}
                onSelect={onEndDateChange}
                initialFocus
                disabled={(date: Date) =>
                  (state.startDate ? date < state.startDate : false) || date < new Date('1900-01-01')
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="project-tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="project-tags"
            placeholder="Add a tag..."
            value={state.tagInput}
            onChange={(e) => onTagInputChange(e.target.value)}
            onKeyDown={onTagKeyDown}
            disabled={loading || state.tags.length >= 10}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onAddTag}
            disabled={loading || !state.tagInput.trim() || state.tags.length >= 10}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {state.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {state.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                <Tag className="h-3 w-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  disabled={loading}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {state.tags.length}/10 tags added. Press Enter or click + to add.
        </p>
      </div>
    </div>
  )
}

export function CreateProjectDialog({ onProjectCreated, trigger }: CreateProjectDialogProps) {
  const { user } = useAuth()
  const workspaceId = user?.agencyId ?? null

  const createProject = useMutation(projectsApi.create)
  const { clients, selectedClientId } = useClientContext()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formState, dispatch] = useReducer(
    projectFormReducer,
    selectedClientId,
    createInitialFormState
  )

  const resetForm = useCallback(() => {
    dispatch({ type: 'reset', clientId: selectedClientId ?? '' })
  }, [selectedClientId])

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value)
    if (value) {
      // Reset form when opening
      resetForm()
    }
  }, [resetForm])

  const handleAddTag = useCallback(() => {
    const trimmed = formState.tagInput.trim()
    if (trimmed && !formState.tags.includes(trimmed) && formState.tags.length < 10) {
      dispatch({ type: 'addTag', value: trimmed })
    }
  }, [formState.tagInput, formState.tags])

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

    if (!user?.id || !workspaceId) {
      toast({ title: 'Authentication required', description: 'Please sign in to create a project.', variant: 'destructive' })
      return
    }

    if (!formState.name.trim()) {
      toast({ title: 'Name required', description: 'Give your project a name to get started.', variant: 'destructive' })
      return
    }

    setLoading(true)

    const selectedClientData = clients.find((c) => c.id === formState.clientId)

    const payload: CreateProjectPayload = {
      name: formState.name.trim(),
      description: formState.description.trim() || undefined,
      status: formState.status,
      clientId: (formState.clientId && formState.clientId !== 'none') ? formState.clientId : undefined,
      clientName: selectedClientData?.name || undefined,
      startDate: formState.startDate ? format(formState.startDate, 'yyyy-MM-dd') : undefined,
      endDate: formState.endDate ? format(formState.endDate, 'yyyy-MM-dd') : undefined,
      tags: formState.tags,
    }

    const legacyId = uuidv4()
    void createProject({
        workspaceId,
        legacyId,
        name: payload.name,
        description: payload.description ?? null,
        status: payload.status,
        clientId: payload.clientId ?? null,
        clientName: payload.clientName ?? null,
        startDateMs: payload.startDate ? new Date(payload.startDate).getTime() : null,
        endDateMs: payload.endDate ? new Date(payload.endDate).getTime() : null,
        tags: payload.tags,
        ownerId: user?.id ?? null,
      })

      .then(() => {
        const nowMs = Date.now()
        const createdProject: ProjectRecord = {
          id: legacyId,
          name: payload.name,
          description: payload.description ?? null,
          status: payload.status,
          clientId: payload.clientId ?? null,
          clientName: payload.clientName ?? null,
          startDate: payload.startDate ? new Date(payload.startDate).toISOString() : null,
          endDate: payload.endDate ? new Date(payload.endDate).toISOString() : null,
          tags: payload.tags,
          ownerId: user?.id ?? null,
          createdAt: new Date(nowMs).toISOString(),
          updatedAt: new Date(nowMs).toISOString(),
          taskCount: 0,
          openTaskCount: 0,
          recentActivityAt: null,
          deletedAt: null,
        }

        toast({
          title: 'Project created!',
          description: `"${createdProject.name}" is ready. Start adding tasks and collaborating.`,
        })

        onProjectCreated?.(createdProject)
        emitDashboardRefresh({ reason: 'project-mutated', clientId: createdProject.clientId ?? null })
        setOpen(false)
        resetForm()
      })
      .catch((error) => {
        logError(error, 'CreateProjectDialog:handleSubmit')
        toast({ title: 'Creation failed', description: asErrorMessage(error), variant: 'destructive' })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [user?.id, workspaceId, clients, formState, toast, onProjectCreated, resetForm, createProject])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new project</DialogTitle>
            <DialogDescription>
              Add a new project to track work, tasks, and team collaboration.
            </DialogDescription>
          </DialogHeader>

          <CreateProjectFormFields
            loading={loading}
            clients={clients}
            state={formState}
            onNameChange={(value) => dispatch({ type: 'setName', value })}
            onDescriptionChange={(value) => dispatch({ type: 'setDescription', value })}
            onStatusChange={(value) => dispatch({ type: 'setStatus', value })}
            onClientChange={(value) => dispatch({ type: 'setClientId', value })}
            onStartDateChange={(value) => dispatch({ type: 'setStartDate', value })}
            onEndDateChange={(value) => dispatch({ type: 'setEndDate', value })}
            onTagInputChange={(value) => dispatch({ type: 'setTagInput', value })}
            onTagKeyDown={handleTagKeyDown}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
          />

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formState.name.trim()}>
              {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
