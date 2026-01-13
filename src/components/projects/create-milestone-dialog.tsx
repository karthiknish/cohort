'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation } from 'convex/react'
import { v4 as uuidv4 } from 'uuid'
import { Calendar as CalendarIcon, LoaderCircle, Plus } from 'lucide-react'
import { format } from 'date-fns'

import { useAuth } from '@/contexts/auth-context'
import { projectMilestonesApi } from '@/lib/convex-api'
import { asErrorMessage } from '@/lib/convex-errors'
import { useToast } from '@/components/ui/use-toast'
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
import type { MilestoneRecord, MilestoneStatus } from '@/types/milestones'
import type { ProjectRecord } from '@/types/projects'
import { MILESTONE_STATUSES } from '@/types/milestones'

const STATUS_LABELS: Record<MilestoneStatus, string> = {
  planned: 'Planned',
  in_progress: 'In progress',
  blocked: 'Blocked',
  completed: 'Completed',
}

export type CreateMilestoneDialogProps = {
  projects: ProjectRecord[]
  trigger?: React.ReactNode
  defaultProjectId?: string
  onCreated?: (milestone: MilestoneRecord) => void
}

export function CreateMilestoneDialog({ projects, trigger, defaultProjectId, onCreated }: CreateMilestoneDialogProps) {
  const { user } = useAuth()
  const createMilestone = useMutation(projectMilestonesApi.create)
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [projectId, setProjectId] = useState(defaultProjectId ?? '')
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<MilestoneStatus>('planned')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (open) {
      setProjectId(defaultProjectId ?? '')
      setTitle('')
      setStatus('planned')
      setStartDate(undefined)
      setEndDate(undefined)
      setDescription('')
    }
  }, [open, defaultProjectId])

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => a.name.localeCompare(b.name))
  }, [projects])

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault()
    if (!user?.id) {
      toast({ title: 'Sign in required', description: 'Please sign in to create milestones.', variant: 'destructive' })
      return
    }
    if (!projectId) {
      toast({ title: 'Project required', description: 'Choose a project for this milestone.', variant: 'destructive' })
      return
    }
    if (!title.trim()) {
      toast({ title: 'Title required', description: 'Give this milestone a name.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      if (!user?.agencyId) throw new Error('Missing workspace')

      const legacyId = uuidv4()
      await createMilestone({
        workspaceId: user.agencyId,
        legacyId,
        projectId,
        title: title.trim(),
        status,
        description: description.trim() || undefined,
        startDateMs: startDate ? startDate.getTime() : undefined,
        endDateMs: endDate ? endDate.getTime() : undefined,
      })

      const milestone: MilestoneRecord = {
        id: legacyId,
        projectId,
        title: title.trim(),
        description: description.trim() || null,
        status,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
        ownerId: user.id,
        order: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      onCreated?.(milestone)
      toast({ title: 'Milestone created', description: `“${milestone.title}” added to the timeline.` })
      setOpen(false)
    } catch (error) {
      toast({ title: 'Could not create', description: asErrorMessage(error), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [projectId, title, status, startDate, endDate, description, user?.id, user?.agencyId, toast, onCreated, createMilestone])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add milestone
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add milestone</DialogTitle>
            <DialogDescription>Plan key delivery points and keep teams aligned.</DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-project">Project</Label>
              <Select value={projectId} onValueChange={setProjectId} disabled={loading}>
                <SelectTrigger id="milestone-project">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {sortedProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="milestone-title">Title</Label>
              <Input
                id="milestone-title"
                placeholder="e.g., Launch beta cohort"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start</Label>
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
                <Label>End</Label>
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

            <div className="space-y-2">
              <Label htmlFor="milestone-status">Status</Label>
              <Select value={status} onValueChange={(value: MilestoneStatus) => setStatus(value)} disabled={loading}>
                <SelectTrigger id="milestone-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {MILESTONE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="milestone-description">Notes</Label>
              <Textarea
                id="milestone-description"
                placeholder="Optional context or acceptance criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !projectId || !title.trim()}>
              {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              Add milestone
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
