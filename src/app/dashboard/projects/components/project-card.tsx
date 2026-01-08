'use client'

import { memo } from 'react'
import Link from 'next/link'
import {
  ListChecks,
  LoaderCircle,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'

import type { ProjectRecord, ProjectStatus } from '@/types/projects'
import { PROJECT_STATUSES } from '@/types/projects'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '../../collaboration/utils'
import { STATUS_CLASSES, STATUS_ICONS, formatStatusLabel, STATUS_ACCENT_COLORS } from './utils'

export interface ProjectCardProps {
  project: ProjectRecord
  onDelete: (project: ProjectRecord) => void
  onEdit: (project: ProjectRecord) => void
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void
  isPendingUpdate?: boolean
}

function ProjectCardComponent({ project, onDelete, onEdit, onUpdateStatus, isPendingUpdate }: ProjectCardProps) {
  const tasksQuery = new URLSearchParams({
    projectId: project.id,
    projectName: project.name,
  })
  const tasksHref = `/dashboard/tasks?${tasksQuery.toString()}`
  const collaborationHref = `/dashboard/collaboration?${new URLSearchParams({ projectId: project.id }).toString()}`
  const StatusIcon = STATUS_ICONS[project.status]

  return (
    <div className={cn(
      "group relative flex flex-col justify-between rounded-xl border border-muted/40 bg-background p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md dark:hover:bg-muted/10",
      isPendingUpdate && "opacity-75 pointer-events-none"
    )}>
      {/* Status accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-opacity group-hover:opacity-100",
          project.status === 'active' ? 'bg-emerald-500' :
            project.status === 'planning' ? 'bg-slate-500' :
              project.status === 'on_hold' ? 'bg-amber-500' : 'bg-blue-500'
        )}
      />

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="font-bold text-lg leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            {project.clientName && (
              <div className="flex items-center gap-1.5">
                {project.clientId ? (
                  <Link href={`/dashboard/clients?clientId=${project.clientId}`} className="text-xs font-semibold text-muted-foreground/70 hover:text-primary hover:underline transition-colors flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    {project.clientName}
                  </Link>
                ) : (
                  <p className="text-xs font-semibold text-muted-foreground/70 flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    {project.clientName}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={cn(
                    STATUS_CLASSES[project.status],
                    "h-6 border px-2 py-0 cursor-pointer transition-all hover:opacity-90 gap-1.5"
                  )}
                >
                  {isPendingUpdate ? (
                    <LoaderCircle className="h-3 w-3 animate-spin" />
                  ) : (
                    <StatusIcon className="h-3 w-3" />
                  )}
                  <span className="text-[10px] font-bold tracking-wider uppercase">
                    {formatStatusLabel(project.status)}
                  </span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px] font-medium">
                {isPendingUpdate ? 'Updating status...' : 'Manage project status'}
              </TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60 hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(project)} className="gap-2">
                  <Pencil className="h-4 w-4" />
                  <span>Edit Details</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                    Update Status
                  </span>
                </div>
                {PROJECT_STATUSES.filter((s) => s !== project.status).map((status) => (
                  <DropdownMenuItem key={status} onClick={() => onUpdateStatus(project, status)} className="gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: STATUS_ACCENT_COLORS[status] }} />
                    <span>{formatStatusLabel(status)}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive gap-2"
                  onClick={() => onDelete(project)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-muted-foreground/80 line-clamp-2 leading-relaxed min-h-[2.5rem]">
            {project.description}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 pt-1">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                <ListChecks className="h-3.5 w-3.5" />
              </div>
              <span>{project.openTaskCount} active tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                <MessageSquare className="h-3.5 w-3.5" />
              </div>
              <span className="tabular-nums">
                {project.recentActivityAt ? formatRelativeTime(project.recentActivityAt) : 'No recent chat'}
              </span>
            </div>
          </div>
        </div>

        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0 h-4.5 bg-muted/40 text-muted-foreground/70 font-medium">
                #{tag}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <span className="text-[10px] font-bold text-muted-foreground/40">+{project.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2.5 pt-4 border-t border-muted/30">
        <Button asChild size="sm" variant="ghost" className="flex-1 h-9 text-xs font-bold uppercase tracking-wider hover:bg-primary/5 hover:text-primary transition-all">
          <Link href={tasksHref} prefetch>
            Overview
          </Link>
        </Button>
        <Separator orientation="vertical" className="h-4 opacity-50" />
        <Button asChild size="sm" variant="ghost" className="flex-1 h-9 text-xs font-bold uppercase tracking-wider hover:bg-primary/5 hover:text-primary transition-all">
          <Link href={collaborationHref} prefetch>
            Discussion
          </Link>
        </Button>
      </div>
    </div>
  )
}

export const ProjectCard = memo(ProjectCardComponent)
ProjectCard.displayName = 'ProjectCard'
