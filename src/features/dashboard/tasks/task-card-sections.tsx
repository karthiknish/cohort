'use client';
import { useCallback } from 'react';
import type { ReactNode } from 'react';
import { Link } from '@/shared/ui/link';
import { Calendar, CalendarX2, ChevronRight, ChevronUp, Clock4, Copy, FolderKanban, Link2, ListTodo, LoaderCircle, MessageCircle, MoreHorizontal, Paperclip, Pencil, Repeat, Trash2, User, } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/shared/ui/tooltip';
import { buildProjectRoute } from '@/lib/project-routes';
import { cn } from '@/lib/utils';
import { useTaskAssigneeList } from './task-participants-context';
import { TASK_STATUSES, type TaskRecord, type TaskStatus } from '@/types/tasks';
import { formatDate, formatPriorityLabel, formatStatusLabel, formatTimeSpent, STATUS_ICONS, taskPillColors, taskViewPriorityPill, taskViewStatusPill, } from './task-types';
type HighlightRenderer = (text: string, query: string) => ReactNode;
function TaskStatusMenuItem({ onQuickStatusChange, status, task, }: {
    onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void;
    status: TaskStatus;
    task: TaskRecord;
}) {
    const NextStatusIcon = STATUS_ICONS[status];
    const onQuickStatusSelect = () => {
        onQuickStatusChange(task, status);
    };
    return (<DropdownMenuItem onClick={onQuickStatusSelect}>
      <NextStatusIcon className="mr-2 size-4"/>
      Move to {formatStatusLabel(status)}
    </DropdownMenuItem>);
}
export type TaskCardHeaderVisibility = {
    title: boolean;
    menu: boolean;
    contextPills: boolean;
    indicators: boolean;
    compactIndicators: boolean;
};
export function TaskCardHeaderSection({ task, isPendingUpdate, onOpen, searchQuery, highlightMatch, onEdit, onDelete, onQuickStatusChange, onClone, onShare, visibility = {
    title: true,
    menu: true,
    contextPills: true,
    indicators: true,
    compactIndicators: false,
}, titleClassName, }: {
    task: TaskRecord;
    isPendingUpdate?: boolean;
    onOpen?: (task: TaskRecord) => void;
    searchQuery: string;
    highlightMatch: HighlightRenderer;
    onEdit: (task: TaskRecord) => void;
    onDelete: (task: TaskRecord) => void;
    onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void;
    onClone?: (task: TaskRecord) => void;
    onShare?: (task: TaskRecord) => void;
    visibility?: TaskCardHeaderVisibility;
    titleClassName?: string;
}) {
    const { title: showTitle, menu: showMenu, contextPills: showContextPills, indicators: showIndicators, compactIndicators, } = visibility;
    const handleOpenTask = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        onOpen?.(task);
    };
    const titleMarkup = onOpen ? (<button type="button" onClick={(e) => handleOpenTask(e)} className="block min-w-0 rounded-md text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2" aria-label={`View task ${task.title}`}>
      <div className="flex items-start gap-2">
        <h3 className={cn('line-clamp-2 min-w-0 flex-1 font-semibold leading-tight text-foreground transition-colors group-hover:text-primary hover:text-primary', titleClassName ?? 'text-[1.05rem]')}>
          {highlightMatch(task.title, searchQuery)}
        </h3>
        {isPendingUpdate ? <LoaderCircle className="mt-0.5 size-4 shrink-0 animate-spin text-primary"/> : null}
      </div>
    </button>) : (<div className="flex items-start gap-2">
      <h3 className={cn('line-clamp-2 min-w-0 flex-1 font-semibold leading-tight text-foreground transition-colors group-hover:text-primary', titleClassName ?? 'text-[1.05rem]')}>
        {highlightMatch(task.title, searchQuery)}
      </h3>
      {isPendingUpdate ? <LoaderCircle className="mt-0.5 size-4 shrink-0 animate-spin text-primary"/> : null}
    </div>);
    if (!showTitle && !showContextPills && !showIndicators && showMenu) {
        return (<TaskCardActionsMenu task={task} onEdit={onEdit} onDelete={onDelete} onQuickStatusChange={onQuickStatusChange} onClone={onClone} onShare={onShare}/>);
    }
    if (!showTitle && !showMenu && showIndicators) {
        return <TaskCardIndicators task={task} compact={compactIndicators}/>;
    }
    return (<div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1 space-y-1">
        {showTitle ? titleMarkup : null}

        {showContextPills && (task.client || task.projectName) ? <TaskCardContextPills task={task}/> : null}

        {showIndicators ? <TaskCardIndicators task={task} compact={compactIndicators}/> : null}
      </div>

      {showMenu ? (<TaskCardActionsMenu task={task} onEdit={onEdit} onDelete={onDelete} onQuickStatusChange={onQuickStatusChange} onClone={onClone} onShare={onShare}/>) : null}
    </div>);
}
function TaskCardContextPills({ task }: {
    task: TaskRecord;
}) {
    return (<div className="flex flex-wrap items-center gap-1.5 pt-0.5">
      {task.client && task.clientId ? (<Link href={`/dashboard/clients?clientId=${task.clientId}`} className={cn('inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors hover:border-accent/30 hover:text-primary', taskPillColors.client)}>
          <span className="size-1.5 rounded-full bg-current/55"/>
          {task.client}
        </Link>) : task.client ? (<p className={cn('inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold', taskPillColors.client)}>
          <span className="size-1.5 rounded-full bg-current/55"/>
          {task.client}
        </p>) : null}

      {task.projectId ? (<Link href={buildProjectRoute(task.projectId, task.projectName)} className={cn('inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors hover:border-accent/30 hover:text-primary', taskPillColors.project)}>
          <FolderKanban className="size-3"/>
          {task.projectName ?? task.projectId}
        </Link>) : task.projectName ? (<p className={cn('inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold', taskPillColors.project)}>
          <FolderKanban className="size-3"/>
          {task.projectName}
        </p>) : null}
    </div>);
}
function TaskCardIndicators({ task, compact = false }: {
    task: TaskRecord;
    compact?: boolean;
}) {
    return (<div className={cn('flex flex-wrap items-center gap-1.5', compact ? 'mt-0' : 'mt-2 gap-2')}>
      {(task.parentId || (task.subtaskCount ?? 0) > 0) ? (<TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.subtask)}>
                {task.parentId ? <ChevronRight className="size-2.5"/> : <ListTodo className="size-2.5"/>}
                {task.parentId ? 'Subtask' : task.subtaskCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {task.parentId ? 'Subtask' : `${task.subtaskCount} subtask${task.subtaskCount !== 1 ? 's' : ''}`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>) : null}

      {(task.commentCount ?? 0) > 0 ? (<TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.comments)}>
                <MessageCircle className="size-2.5"/>
                {task.commentCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>{task.commentCount} comment{task.commentCount !== 1 ? 's' : ''}</TooltipContent>
          </Tooltip>
        </TooltipProvider>) : null}

      {(task.attachments ?? []).length > 0 ? (<TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.attachments)}>
                <Paperclip className="size-2.5"/>
                {task.attachments?.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {task.attachments?.length} attachment{(task.attachments?.length ?? 0) !== 1 ? 's' : ''}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>) : null}

      {(task.timeSpentMinutes ?? 0) > 0 ? (<TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.time)}>
                <Clock4 className="size-2.5"/>
                {formatTimeSpent(task.timeSpentMinutes)}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Time spent: {formatTimeSpent(task.timeSpentMinutes)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>) : null}

      {task.isRecurring && task.recurrenceRule && task.recurrenceRule !== 'none' ? (<TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.recurring)}>
                <Repeat className="size-2.5"/>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Recurring: {task.recurrenceRule}</TooltipContent>
          </Tooltip>
        </TooltipProvider>) : null}

      {(task.sharedWith ?? []).length > 0 ? (<TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={cn('h-6 rounded-full px-2.5 text-[10px] font-semibold', taskPillColors.shared)}>
                <Link2 className="size-2.5"/>
                {task.sharedWith?.length}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>Shared with {task.sharedWith?.length} person{(task.sharedWith?.length ?? 0) !== 1 ? 's' : ''}</TooltipContent>
          </Tooltip>
        </TooltipProvider>) : null}
    </div>);
}
function TaskCardActionsMenu({ task, onEdit, onDelete, onQuickStatusChange, onClone, onShare, }: {
    task: TaskRecord;
    onEdit: (task: TaskRecord) => void;
    onDelete: (task: TaskRecord) => void;
    onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void;
    onClone?: (task: TaskRecord) => void;
    onShare?: (task: TaskRecord) => void;
}) {
    const handleEditClick = () => {
        onEdit(task);
    };
    const handleDeleteClick = () => {
        onDelete(task);
    };
    const handleCloneClick = () => {
        onClone?.(task);
    };
    const handleShareClick = () => {
        onShare?.(task);
    };
    return (<div className="shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8 rounded-full border border-transparent text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground" aria-label="Task actions" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="size-4"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {TASK_STATUSES.flatMap((status) => status !== task.status && status !== 'archived'
            ? [<TaskStatusMenuItem key={status} onQuickStatusChange={onQuickStatusChange} status={status} task={task}/>]
            : [])}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEditClick}>
            <Pencil className="mr-2 size-4"/>
            Edit task
          </DropdownMenuItem>
          {onClone ? (<DropdownMenuItem onClick={handleCloneClick}>
              <Copy className="mr-2 size-4"/>
              Duplicate task
            </DropdownMenuItem>) : null}
          {onShare ? (<DropdownMenuItem onClick={handleShareClick}>
              <Link2 className="mr-2 size-4"/>
              Share task
            </DropdownMenuItem>) : null}
          {(onClone || onShare) ? <DropdownMenuSeparator /> : null}
          <DropdownMenuItem onClick={handleDeleteClick} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 size-4"/>
            Delete task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>);
}
export function TaskCardStatusBadge({ status }: {
    status: TaskStatus;
}) {
    const Icon = STATUS_ICONS[status];
    return (<Badge variant="outline" className={cn('gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', taskViewStatusPill[status])}>
      <Icon className="size-3 shrink-0" aria-hidden/>
      {formatStatusLabel(status)}
    </Badge>);
}
export function TaskCardPriorityBadge({ priority }: {
    priority: TaskRecord['priority'];
}) {
    return (<Badge variant="outline" className={cn('gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', taskViewPriorityPill[priority])}>
      <ChevronUp className="size-3 shrink-0" aria-hidden/>
      {formatPriorityLabel(priority)}
    </Badge>);
}
export function TaskCardCompactMeta({ task, overdue, dueSoon, compact = false, }: {
    task: TaskRecord;
    overdue: boolean;
    dueSoon: boolean;
    compact?: boolean;
}) {
    const assignee = useTaskAssigneeList(task.assignedTo);
    return (<div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground', compact ? 'pt-1' : 'mt-auto border-t border-border/60 pt-3')}>
      <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
        <User className="size-3.5 shrink-0 opacity-70" aria-hidden/>
        <span className="truncate font-medium text-foreground">{assignee}</span>
      </span>
      <span className={cn('inline-flex items-center gap-1.5', overdue && 'font-medium text-destructive', dueSoon && !overdue && 'font-medium text-warning')}>
        <Calendar className="size-3.5 shrink-0 opacity-70" aria-hidden/>
        {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
      </span>
      {!compact ? (<span className="inline-flex items-center gap-1.5">
          <Clock4 className="size-3.5 shrink-0 opacity-70" aria-hidden/>
          {formatTimeSpent(task.timeSpentMinutes)}
        </span>) : null}
    </div>);
}
export function TaskCardOverdueBanner() {
    return (<div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-lg rounded-tr-lg bg-destructive px-2 py-0.5 text-destructive-foreground">
      <CalendarX2 className="size-3"/>
      <span className="text-[9px] font-bold uppercase">Overdue</span>
    </div>);
}
