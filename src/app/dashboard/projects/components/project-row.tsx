'use client'

import { memo } from 'react'
import Link from 'next/link'
import {
  Calendar,
  ListChecks,
  LoaderCircle,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Tag,
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
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '../../collaboration/utils'
import { STATUS_CLASSES, STATUS_ICONS, formatStatusLabel, formatTaskSummary, formatDateRange, formatDate, STATUS_ACCENT_COLORS } from './utils'

export interface ProjectRowProps {
  project: ProjectRecord
  onDelete: (project: ProjectRecord) => void
  onEdit: (project: ProjectRecord) => void
  onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void
  isPendingUpdate?: boolean
}

function ProjectRowComponent({ project, onDelete, onEdit, onUpdateStatus, isPendingUpdate }: ProjectRowProps) {
  const tasksQuery = new URLSearchParams({
    projectId: project.id,
    projectName: project.name,
  })
  const tasksHref = `/dashboard/tasks?${tasksQuery.toString()}`
  const collaborationHref = `/dashboard/collaboration?${new URLSearchParams({ projectId: project.id }).toString()}`
  const StatusIcon = STATUS_ICONS[project.status]

  return (
    <div className={cn(
      "group relative rounded-xl border border-muted/30 bg-background p-5 shadow-sm transition-all hover:bg-muted/30 sm:p-6",
      isPendingUpdate && "opacity-75 pointer-events-none"
    )}>
      {/* Status accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-opacity opacity-70 group-hover:opacity-100",
          project.status === 'active' ? 'bg-emerald-500' :
            project.status === 'planning' ? 'bg-slate-500' :
              project.status === 'on_hold' ? 'bg-amber-500' : 'bg-blue-500'
        )}
      />

      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
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
                    <span className="text-[10px] font-bold tracking-wider uppercase leading-none">
                      {formatStatusLabel(project.status)}
                    </span>
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
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
                </DropdownMenuContent>
              </DropdownMenu>

              {project.clientName && (
                project.clientId ? (
                  <Link href={`/dashboard/clients?clientId=${project.clientId}`}>
                    <Badge variant="secondary" className="h-6 text-[11px] font-medium bg-muted/50 hover:bg-muted cursor-pointer transition-colors border-none px-2 shadow-none">
                      {project.clientName}
                    </Badge>
                  </Link>
                ) : (
                  <Badge variant="outline" className="h-6 text-[11px] border-dashed border-muted/60 font-medium px-2">
                    {project.clientName}
                  </Badge>
                )
              )}
            </div>
          </div>

          {project.description && (
            <p className="text-sm text-muted-foreground/80 line-clamp-1 max-w-2xl leading-relaxed">
              {project.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-muted-foreground/70">
            <span className="inline-flex items-center gap-2 font-medium">
              <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
                <ListChecks className="h-3 w-3" />
              </div>
              {formatTaskSummary(project.openTaskCount, project.taskCount)}
            </span>
            <span className="inline-flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                <Calendar className="h-3 w-3" />
              </div>
              <span className="font-medium">{formatDateRange(project.startDate, project.endDate)}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                <MessageSquare className="h-3 w-3" />
              </div>
              <span className="tabular-nums">
                {project.recentActivityAt ? `Active ${formatRelativeTime(project.recentActivityAt)}` : 'No recent chat'}
              </span>
            </span>
          </div>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="inline-flex items-center gap-1 text-[10px] h-4.5 bg-muted/30 text-muted-foreground/60 border-none font-medium">
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3.5 shrink-0">
          <div className="text-right text-[11px] font-medium text-muted-foreground/50 tabular-nums">
            <p>Created {formatDate(project.createdAt)}</p>
            <p>Updated {formatDate(project.updatedAt)}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 text-xs font-semibold gap-2 border-muted hover:bg-muted/50 transition-all"
              onClick={() => onEdit(project)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs font-semibold gap-2 bg-primary/5 text-primary border-primary/20 hover:bg-primary/10 transition-all">
                  <span>View Project</span>
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                  <Link href={tasksHref} prefetch>
                    <ListChecks className="h-4 w-4" />
                    <span>Tasks Overview</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                  <Link href={collaborationHref} prefetch>
                    <MessageSquare className="h-4 w-4" />
                    <span>Open Discussion</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                  onClick={() => onDelete(project)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ProjectRow = memo(ProjectRowComponent)
ProjectRow.displayName = 'ProjectRow'
