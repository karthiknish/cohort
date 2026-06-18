'use client';
import { Link } from '@/shared/ui/link';
import { memo, useCallback, useMemo, ViewTransition } from 'react';
import { Calendar, LoaderCircle, MessageSquare, Pencil, Tag, } from 'lucide-react';
import type { ProjectRecord, ProjectStatus } from '@/types/projects';
import { PROJECT_STATUSES } from '@/types/projects';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { buildProjectTasksRoute } from '@/lib/project-routes';
import { listItemEnterClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '../../collaboration/utils';
import { ProjectActionsMenu } from './project-actions-menu';
import { ProjectTaskProgress } from './project-task-progress';
import { STATUS_CLASSES, STATUS_ICONS, formatStatusLabel, formatDate, formatDateRange, isProjectOverdue, STATUS_ACCENT_COLORS, } from './utils';
export interface ProjectRowProps {
    project: ProjectRecord;
    onDelete: (project: ProjectRecord) => void;
    onEdit: (project: ProjectRecord) => void;
    onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void;
    isPendingUpdate?: boolean;
}
function ProjectRowComponent({ project, onDelete, onEdit, onUpdateStatus, isPendingUpdate }: ProjectRowProps) {
    const tasksHref = buildProjectTasksRoute({
        projectId: project.id,
        projectName: project.name,
        clientId: project.clientId,
        clientName: project.clientName,
    });
    const StatusIcon = STATUS_ICONS[project.status];
    const overdue = isProjectOverdue(project);
    const handleEdit = () => onEdit(project);
    const statusAccentStyles = Object.fromEntries(Object.entries(STATUS_ACCENT_COLORS).map(([status, backgroundColor]) => [status, { backgroundColor }])) as Record<ProjectStatus, {
        backgroundColor: string;
    }>;
    const statusUpdateHandlers = Object.fromEntries(PROJECT_STATUSES.flatMap((status) => status !== project.status
        ? [[status, () => onUpdateStatus(project, status)] as const]
        : [])) as Partial<Record<ProjectStatus, () => void>>;
    return (<ViewTransition>
      <article className={cn('group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-sm ring-1 ring-border/30 sm:p-6', listItemEnterClass, 'transition-[border-color,box-shadow,background-color] hover:border-primary/20 hover:bg-muted/15 hover:shadow-md', isPendingUpdate && 'pointer-events-none opacity-75')}>
        <div className={cn('absolute bottom-0 left-0 top-0 w-1 rounded-l-xl', project.status === 'active'
            ? 'bg-success'
            : project.status === 'planning'
                ? 'bg-muted-foreground/50'
                : project.status === 'on_hold'
                    ? 'bg-warning'
                    : 'bg-info')} aria-hidden/>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
                {project.name}
              </h3>
              {overdue ? (<Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive text-[10px]">
                  Overdue
                </Badge>) : null}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge variant="outline" className={cn(STATUS_CLASSES[project.status], 'h-6 cursor-pointer gap-1.5 border px-2 py-0 hover:opacity-90')}>
                    {isPendingUpdate ? (<LoaderCircle className="size-3 animate-spin"/>) : (<StatusIcon className="size-3"/>)}
                    <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                      {formatStatusLabel(project.status)}
                    </span>
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <div className="px-2 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                      Update status
                    </span>
                  </div>
                  {PROJECT_STATUSES.flatMap((status) => status !== project.status
            ? [(<DropdownMenuItem key={status} onClick={statusUpdateHandlers[status]} className="gap-2">
                      <div className="size-2 rounded-full" style={statusAccentStyles[status]}/>
                      <span>{formatStatusLabel(status)}</span>
                    </DropdownMenuItem>)]
            : [])}
                </DropdownMenuContent>
              </DropdownMenu>

              {project.clientName ? (project.clientId ? (<Link href={`/dashboard/clients?clientId=${project.clientId}`}>
                    <Badge variant="secondary" className="h-6 text-[11px] font-medium hover:bg-muted">
                      {project.clientName}
                    </Badge>
                  </Link>) : (<Badge variant="outline" className="h-6 text-[11px] border-dashed font-medium">
                    {project.clientName}
                  </Badge>)) : null}
            </div>

            {project.description ? (<p className="max-w-2xl text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {project.description}
              </p>) : null}

            <ProjectTaskProgress project={project} className="max-w-md"/>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5"/>
                {formatDateRange(project.startDate, project.endDate)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="size-3.5"/>
                {project.recentActivityAt ? `Active ${formatRelativeTime(project.recentActivityAt)}` : 'No recent chat'}
              </span>
            </div>

            {project.tags.length > 0 ? (<div className="flex flex-wrap items-center gap-2">
                {project.tags.map((tag) => (<Badge key={tag} variant="secondary" className="inline-flex h-5 items-center gap-1 px-2 text-[10px] font-medium">
                    <Tag className="size-2.5"/>
                    {tag}
                  </Badge>))}
              </div>) : null}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-3">
            <div className="text-right text-[11px] text-muted-foreground tabular-nums">
              <p>Created {formatDate(project.createdAt)}</p>
              <p>Updated {formatDate(project.updatedAt)}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button size="sm" variant="outline" className="h-8 gap-2 text-xs" onClick={handleEdit}>
                <Pencil className="size-3.5"/>
                Edit
              </Button>
              <Button asChild size="sm" variant="default" className="h-8 text-xs">
                <Link href={tasksHref} prefetch>
                  Open tasks
                </Link>
              </Button>
              <ProjectActionsMenu project={project} onEdit={onEdit} onDelete={onDelete} onUpdateStatus={onUpdateStatus} showEditItem={false}/>
            </div>
          </div>
        </div>
      </article>
    </ViewTransition>);
}
export const ProjectRow = Object.assign(ProjectRowComponent, { displayName: 'ProjectRow' });
