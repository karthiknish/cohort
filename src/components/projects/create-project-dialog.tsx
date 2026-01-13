'use client'

import { useCallback, useState } from 'react'
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

export function CreateProjectDialog({ onProjectCreated, trigger }: CreateProjectDialogProps) {
  const { user } = useAuth()
  const workspaceId = user?.agencyId ?? null

  const createProject = useMutation(projectsApi.create)
  const { clients, selectedClient, selectedClientId } = useClientContext()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('planning')
  const [clientId, setClientId] = useState<string>(selectedClientId ?? '')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const resetForm = useCallback(() => {
    setName('')
    setDescription('')
    setStatus('planning')
    setClientId(selectedClientId ?? '')
    setStartDate(undefined)
    setEndDate(undefined)
    setTags([])
    setTagInput('')
  }, [selectedClientId])

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value)
    if (value) {
      // Reset form when opening
      resetForm()
    }
  }, [resetForm])

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

    if (!user?.id || !workspaceId) {
      toast({ title: 'Authentication required', description: 'Please sign in to create a project.', variant: 'destructive' })
      return
    }

    if (!name.trim()) {
      toast({ title: 'Name required', description: 'Give your project a name to get started.', variant: 'destructive' })
      return
    }

    setLoading(true)

    try {
      const selectedClientData = clients.find((c) => c.id === clientId)

      const payload: CreateProjectPayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        clientId: (clientId && clientId !== 'none') ? clientId : undefined,
        clientName: selectedClientData?.name || undefined,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
        tags,
      }

      const legacyId = uuidv4()
      await createProject({
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
        ownerId: null,
      })

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
        ownerId: null,
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
    } catch (error) {
      logError(error, 'CreateProjectDialog:handleSubmit')
      toast({ title: 'Creation failed', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [user?.id, workspaceId, name, description, status, clientId, clients, startDate, endDate, tags, toast, onProjectCreated, resetForm, createProject])

  const formatStatusLabel = (value: ProjectStatus): string => {
    return value
      .replace('_', ' ')
      .split(' ')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ')
  }

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

          <div className="mt-6 space-y-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="project-name">
                Project name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-name"
                placeholder="e.g., Q1 Marketing Campaign"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                placeholder="Brief overview of the project goals and scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            {/* Status and Client */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project-status">Status</Label>
                <Select value={status} onValueChange={(value: ProjectStatus) => setStatus(value)} disabled={loading}>
                  <SelectTrigger id="project-status">
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
                <Label htmlFor="project-client">Client / Workspace</Label>
                <Select value={clientId} onValueChange={setClientId} disabled={loading}>
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
                        !endDate && 'text-muted-foreground'
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
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="project-tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="project-tags"
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
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                {tags.length}/10 tags added. Press Enter or click + to add.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Create project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
