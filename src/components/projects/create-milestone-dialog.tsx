'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Calendar, LoaderCircle, Plus } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
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
import { Textarea } from '@/components/ui/textarea'
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
  const { user, getIdToken } = useAuth()
  const { toast } = useToast()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [projectId, setProjectId] = useState(defaultProjectId ?? '')
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<MilestoneStatus>('planned')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (open) {
      setProjectId(defaultProjectId ?? '')
      setTitle('')
      setStatus('planned')
      setStartDate('')
      setEndDate('')
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
      const token = await getIdToken()
      const response = await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          status,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          description: description.trim() || undefined,
        }),
      })

      if (!response.ok) {
        let message = 'Failed to create milestone'
        try {
          const payload = (await response.json()) as { error?: string }
          if (payload?.error) message = payload.error
        } catch {
          // ignore
        }
        throw new Error(message)
      }

      const data = (await response.json()) as { milestone: MilestoneRecord }
      onCreated?.(data.milestone)
      toast({ title: 'Milestone created', description: `“${data.milestone.title}” added to the timeline.` })
      setOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create milestone'
      toast({ title: 'Could not create', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [projectId, title, status, startDate, endDate, description, user?.id, getIdToken, toast, onCreated])

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
                <Label htmlFor="milestone-start">Start</Label>
                <div className="relative">
                  <Input
                    id="milestone-start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={loading}
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="milestone-end">End</Label>
                <div className="relative">
                  <Input
                    id="milestone-end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || undefined}
                    disabled={loading}
                  />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
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
