'use client'

import { useCallback, useReducer, useRef, useState } from 'react'
import { useMutation } from 'convex/react'
import { LoaderCircle, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

import { projectsApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { emitDashboardRefresh } from '@/lib/refresh-bus'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { useToast } from '@/shared/ui/use-toast'
import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'

import { CreateProjectFormFields } from './create-project-dialog-form'

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

export type ProjectFormState = {
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

export function CreateProjectDialog({ onProjectCreated, trigger }: CreateProjectDialogProps) {
  const { user } = useAuth()
  const workspaceId = user?.agencyId ?? null

  const createProject = useMutation(projectsApi.create)
  const { clients, selectedClientId } = useClientContext()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)

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
      setNameError(null)
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
      setNameError('Give your project a name to get started.')
      nameInputRef.current?.focus()
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

  const handleNameChange = useCallback(
    (value: string) => {
      setNameError(null)
      dispatch({ type: 'setName', value })
    },
    [dispatch]
  )

  const handleDescriptionChange = useCallback(
    (value: string) => {
      dispatch({ type: 'setDescription', value })
    },
    [dispatch]
  )

  const handleStatusChange = useCallback(
    (value: ProjectStatus) => {
      dispatch({ type: 'setStatus', value })
    },
    [dispatch]
  )

  const handleClientChange = useCallback(
    (value: string) => {
      dispatch({ type: 'setClientId', value })
    },
    [dispatch]
  )

  const handleStartDateChange = useCallback(
    (value: Date | undefined) => {
      dispatch({ type: 'setStartDate', value })
    },
    [dispatch]
  )

  const handleEndDateChange = useCallback(
    (value: Date | undefined) => {
      dispatch({ type: 'setEndDate', value })
    },
    [dispatch]
  )

  const handleTagInputChange = useCallback(
    (value: string) => {
      dispatch({ type: 'setTagInput', value })
    },
    [dispatch]
  )

  const handleCancel = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button id="create-project-trigger" type="button" className="gap-2 shadow-sm transition-shadow hover:shadow-md">
            <Plus className="h-4 w-4" aria-hidden />
            New project
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
            nameError={nameError}
            nameInputRef={nameInputRef}
            onNameChange={handleNameChange}
            onDescriptionChange={handleDescriptionChange}
            onStatusChange={handleStatusChange}
            onClientChange={handleClientChange}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            onTagInputChange={handleTagInputChange}
            onTagKeyDown={handleTagKeyDown}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            formatStatusLabel={formatStatusLabel}
          />

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
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
