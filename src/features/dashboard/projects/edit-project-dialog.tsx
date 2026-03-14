'use client'

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import { useMutation } from 'convex/react'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'

import { projectsApi } from '@/lib/convex-api'
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
} from '@/shared/ui/dialog'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { EditProjectFormFields } from './edit-project-dialog-form'

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

export type EditProjectAction =
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

export function EditProjectDialog({ project, open, onOpenChange, onProjectUpdated }: EditProjectDialogProps) {
  const { user } = useAuth()
  const workspaceId = user?.agencyId ?? null

  const updateProject = useMutation(projectsApi.update)
  const { clients } = useClientContext()
  const { toast } = useToast()

  const [state, dispatch] = useReducer(editProjectReducer, INITIAL_EDIT_PROJECT_STATE)
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false)
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

  const requestClose = useCallback(() => {
    if (loading) return

    if (hasChanges) {
      setDiscardDialogOpen(true)
      return
    }

    onOpenChange(false)
  }, [hasChanges, loading, onOpenChange])

  const handleDialogOpenChange = useCallback((nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true)
      return
    }

    requestClose()
  }, [onOpenChange, requestClose])

  const handleConfirmDiscard = useCallback(() => {
    setDiscardDialogOpen(false)
    onOpenChange(false)
  }, [onOpenChange])

  if (!project) return null

  return (
    <>
      <Dialog open={open} onOpenChange={handleDialogOpenChange}>
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
              <Button type="button" variant="outline" onClick={requestClose} disabled={loading}>
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

      <ConfirmDialog
        open={open && discardDialogOpen}
        onOpenChange={setDiscardDialogOpen}
        title="Discard unsaved changes?"
        description="You have unsaved changes in this project. Closing now will discard them."
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        variant="warning"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setDiscardDialogOpen(false)}
      />
    </>
  )
}
