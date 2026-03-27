'use client'

import { useMemo } from 'react'
import { FolderKanban, Plus, RefreshCw, TriangleAlert } from 'lucide-react'

import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import type { MilestoneRecord, MilestoneStatus } from '@/types/milestones'
import { MILESTONE_STATUSES } from '@/types/milestones'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { cn } from '@/lib/utils'
import { CreateMilestoneDialog } from '@/features/dashboard/projects/create-milestone-dialog'
import { 
  STATUS_CLASSES, 
  STATUS_ICONS, 
  formatStatusLabel, 
  computeTimelineRange, 
  parseDate, 
  addDays, 
  formatShortDate,
  milestoneStatusColor 
} from './utils'

export interface GanttViewProps {
  projects: ProjectRecord[]
  milestones: Record<string, MilestoneRecord[]>
  loading: boolean
  error: string | null
  onRefresh: () => void
  onMilestoneCreated: (milestone: MilestoneRecord) => void
}

export function GanttView({ projects, milestones, loading, error, onRefresh, onMilestoneCreated }: GanttViewProps) {
  const allMilestones = useMemo(() => Object.values(milestones).flat(), [milestones])
  const { start, end } = useMemo(() => computeTimelineRange(projects, allMilestones), [projects, allMilestones])
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const dayWidth = 18
  const timelineWidth = Math.max(totalDays * dayWidth, 640)
  const timelineStyle = useMemo(() => ({ width: timelineWidth }), [timelineWidth])
  const loadingSlots = ['loading-1', 'loading-2', 'loading-3', 'loading-4', 'loading-5']

  if (loading) {
    return (
      <div className="space-y-3">
        {loadingSlots.map((slot) => (
          <div key={slot} className="flex items-center gap-3">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 flex-1" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/10 p-6 text-center">
        <TriangleAlert className="mx-auto h-10 w-10 text-destructive/60" />
        <p className="mt-2 text-sm font-medium text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRefresh}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh data
        </Button>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-muted/60 bg-muted/10 p-8 text-center">
        <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No projects to chart</h3>
        <p className="mt-1 text-sm text-muted-foreground">Create a project to see it on the timeline.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          Showing {projects.length} project{projects.length !== 1 ? 's' : ''} with {allMilestones.length} milestones
        </span>
        <div className="flex items-center gap-2 text-xs">
          {MILESTONE_STATUSES.map((status) => (
            <div key={status} className="inline-flex items-center gap-1 rounded-full border px-2 py-1">
              <MilestoneStatusIndicator status={status} />
              <span className="capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-[240px_1fr] items-start gap-2">
        <div className="space-y-2">
          <div className="text-xs font-medium uppercase text-muted-foreground">Projects</div>
          {projects.map((project) => (
            <ProjectTimelineRow key={project.id} project={project} onMilestoneCreated={onMilestoneCreated} />
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-full overflow-hidden rounded-md border">
            <div className="border-b bg-muted/50 px-4 py-2 text-xs font-medium uppercase text-muted-foreground">
              Timeline
            </div>
            <div className="relative">
              <div className="relative bg-background" style={timelineStyle}>
                <TimelineGrid start={start} totalDays={totalDays} dayWidth={dayWidth} />
                <TodayMarker start={start} dayWidth={dayWidth} />
                <div className="divide-y">
                  {projects.map((project) => (
                    <div key={project.id} className="relative h-16">
                      {renderMilestonesForProject(project.id, milestones[project.id] ?? [], start, dayWidth, totalDays)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function renderMilestonesForProject(
  projectId: string,
  milestoneList: MilestoneRecord[],
  start: Date,
  dayWidth: number,
  totalDays: number,
) {
  if (milestoneList.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        No milestones yet
      </div>
    )
  }

  return milestoneList.map((milestone) => {
    return <MilestoneBar key={milestone.id} milestone={milestone} start={start} dayWidth={dayWidth} totalDays={totalDays} />
  })
}

function MilestoneStatusIndicator({ status }: { status: MilestoneStatus }) {
  const indicatorStyle = useMemo(() => ({ backgroundColor: milestoneStatusColor(status) }), [status])

  return <span className="h-2 w-2 rounded-full" style={indicatorStyle} />
}

function ProjectTimelineRow({
  project,
  onMilestoneCreated,
}: {
  project: ProjectRecord
  onMilestoneCreated: (milestone: MilestoneRecord) => void
}) {
  const trigger = useMemo(
    () => (
      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Add milestone">
        <Plus className="h-4 w-4" />
      </Button>
    ),
    []
  )

  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
      <div className="flex items-center gap-2 truncate">
        <StatusPill status={project.status} />
        <span className="truncate" title={project.name}>{project.name}</span>
      </div>
      <CreateMilestoneDialog
        projects={[project]}
        defaultProjectId={project.id}
        onCreated={onMilestoneCreated}
        trigger={trigger}
      />
    </div>
  )
}

function MilestoneBar({
  milestone,
  start,
  dayWidth,
  totalDays,
}: {
  milestone: MilestoneRecord
  start: Date
  dayWidth: number
  totalDays: number
}) {
  const { left, width, startLabel, endLabel } = computeBarMetrics(milestone, start, dayWidth, totalDays)
  const color = milestoneStatusColor(milestone.status)
  const barStyle = useMemo(() => ({ left, width, backgroundColor: color, minWidth: 64 }), [left, width, color])

  return (
    <div
      className="absolute top-2 flex h-10 items-center rounded-md px-3 text-xs text-primary-foreground shadow-sm"
      style={barStyle}
      title={`${milestone.title} • ${startLabel} → ${endLabel}`}
    >
      <div className="flex flex-col truncate">
        <span className="font-medium truncate text-[13px]">{milestone.title}</span>
        <span className="text-[11px] opacity-80">{startLabel} → {endLabel}</span>
      </div>
    </div>
  )
}

function computeBarMetrics(milestone: MilestoneRecord, chartStart: Date, dayWidth: number, totalDays: number) {
  const startDate = parseDate(milestone.startDate) ?? chartStart
  const endDate = parseDate(milestone.endDate) ?? startDate
  const safeEnd = endDate < startDate ? startDate : endDate

  const offsetDays = Math.max(0, Math.floor((startDate.getTime() - chartStart.getTime()) / (1000 * 60 * 60 * 24)))
  const durationDays = Math.max(1, Math.floor((safeEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const clampedDuration = Math.min(durationDays, totalDays - offsetDays)

  const left = offsetDays * dayWidth + 4
  const width = clampedDuration * dayWidth - 8

  return {
    left,
    width,
    startLabel: formatShortDate(startDate),
    endLabel: formatShortDate(safeEnd),
  }
}

function TimelineGrid({ start, totalDays, dayWidth }: { start: Date; totalDays: number; dayWidth: number }) {
  const formatter = useMemo(() => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }), [])
  const weeks = Math.ceil(totalDays / 7)
  return (
    <div className="relative">
      <div className="flex border-b text-[11px] text-muted-foreground">
        {Array.from({ length: weeks }, (_, index) => `week-${index + 1}`).map((slot, index) => {
          const weekStart = addDays(start, index * 7)
          const label = `${formatter.format(weekStart)}`
          return <TimelineWeekCell key={slot} weekNumber={index + 1} label={label} width={Math.min(7, totalDays - index * 7) * dayWidth} />
        })}
      </div>
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: totalDays }, (_, index) => `day-${index + 1}`).map((slot, index) => (
          <TimelineDayCell key={slot} left={index * dayWidth} width={dayWidth} />
        ))}
      </div>
    </div>
  )
}

function TimelineWeekCell({ weekNumber, label, width }: { weekNumber: number; label: string; width: number }) {
  const weekStyle = useMemo(() => ({ width }), [width])

  return (
    <div className="border-r px-2 py-1" style={weekStyle}>
      Week {weekNumber} • {label}
    </div>
  )
}

function TimelineDayCell({ left, width }: { left: number; width: number }) {
  const dayStyle = useMemo(() => ({ left, width }), [left, width])

  return <div className="absolute top-0 h-full border-r last:border-r-0" style={dayStyle} />
}

function TodayMarker({ start, dayWidth }: { start: Date; dayWidth: number }) {
  const today = new Date()
  const offsetDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const markerStyle = useMemo(() => ({ left: offsetDays * dayWidth }), [offsetDays, dayWidth])

  if (offsetDays < 0) return null

  return (
    <div className="pointer-events-none absolute inset-y-0" style={markerStyle}>
      <div className="absolute inset-y-0 w-px bg-warning" />
      <div className="absolute -top-6 -ml-8 rounded-md bg-warning px-2 py-1 text-[11px] font-medium text-warning-foreground shadow">
        Today
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: ProjectStatus }) {
  const Icon = STATUS_ICONS[status]
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium',
      STATUS_CLASSES[status]
    )}>
      <Icon className="h-3 w-3" />
      {formatStatusLabel(status)}
    </span>
  )
}
