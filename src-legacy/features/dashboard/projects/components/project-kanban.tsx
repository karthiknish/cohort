'use client';
import { useCallback, useId, useMemo, useReducer } from 'react';
import { GripVertical } from 'lucide-react';
import type { ProjectRecord, ProjectStatus } from '@/types/projects';
import { PROJECT_STATUSES } from '@/types/projects';
import { Badge } from '@/shared/ui/badge';
import { LiveRegion } from '@/shared/ui/live-region';
import { ScrollArea } from '@/shared/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ProjectCard } from './project-card';
import { canDragProjectKanbanCard, INITIAL_PROJECT_KANBAN_STATE, projectKanbanReducer, resolveProjectKanbanMoveTarget, type DraggedProject, } from './project-kanban-logic';
import { formatStatusLabel, STATUS_DOT_STYLES } from './utils';
export interface ProjectKanbanProps {
    projects: ProjectRecord[];
    pendingStatusUpdates: Set<string>;
    onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void;
    onEdit: (project: ProjectRecord) => void;
    onDelete: (project: ProjectRecord) => void;
}
export function ProjectKanban({ projects, pendingStatusUpdates, onUpdateStatus, onEdit, onDelete, }: ProjectKanbanProps) {
    const [{ draggedProject, dragOverStatus, boardAnnouncement }, dispatch] = useReducer(projectKanbanReducer, INITIAL_PROJECT_KANBAN_STATE);
    const keyboardInstructionsId = useId();
    const columns = PROJECT_STATUSES.map((status) => ({
        status,
        label: formatStatusLabel(status),
        items: projects.filter((project) => project.status === status),
    }));
    const handleDragStart = (event: React.DragEvent, project: ProjectRecord) => {
        if (!canDragProjectKanbanCard(project, pendingStatusUpdates))
            return;
        dispatch({
            type: 'startDrag',
            draggedProject: { id: project.id, sourceStatus: project.status },
        });
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', project.id);
    };
    const handleDragOver = (event: React.DragEvent, status: ProjectStatus) => {
        if (!draggedProject)
            return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        dispatch({ type: 'setDragOverStatus', status });
    };
    const handleDragLeave = () => {
        dispatch({ type: 'setDragOverStatus', status: null });
    };
    const handleDrop = (event: React.DragEvent, targetStatus: ProjectStatus) => {
        event.preventDefault();
        dispatch({ type: 'setDragOverStatus', status: null });
        if (!draggedProject)
            return;
        const project = projects.find((entry) => entry.id === draggedProject.id);
        if (project &&
            draggedProject.sourceStatus !== targetStatus &&
            canDragProjectKanbanCard(project, pendingStatusUpdates)) {
            dispatch({
                type: 'setBoardAnnouncement',
                message: `${project.name} moved to ${formatStatusLabel(targetStatus)}.`,
            });
            void onUpdateStatus(project, targetStatus);
        }
        dispatch({ type: 'resetDragState' });
    };
    const handleKeyboardMoveProject = (project: ProjectRecord, direction: 'previous' | 'next') => {
        if (!canDragProjectKanbanCard(project, pendingStatusUpdates))
            return;
        const targetStatus = resolveProjectKanbanMoveTarget(project.status, direction);
        if (!targetStatus) {
            dispatch({
                type: 'setBoardAnnouncement',
                message: `${project.name} is already in the ${formatStatusLabel(project.status)} column.`,
            });
            return;
        }
        dispatch({
            type: 'setBoardAnnouncement',
            message: `${project.name} moved to ${formatStatusLabel(targetStatus)}.`,
        });
        void onUpdateStatus(project, targetStatus);
    };
    const handleDragEnd = () => {
        dispatch({ type: 'resetDragState' });
    };
    return (<div className="space-y-3 py-2">
      <LiveRegion message={boardAnnouncement}/>
      <p id={keyboardInstructionsId} className="sr-only">
        Use Alt plus Left Arrow or Alt plus Right Arrow on a project card grip to move it between status
        columns. You can also drag projects by the grip handle. Status updates save when you drop a card in
        another column.
      </p>
      <p className="px-1 text-xs text-muted-foreground">
        Drag projects between columns to update status. Use the grip handle so card links and menus stay
        clickable.
      </p>
      <ScrollArea className="w-full">
        <div className="flex min-h-[28rem] w-full gap-4 pb-4 pr-2">
          {columns.map((column) => (<ProjectKanbanColumn key={column.status} column={column} dragOverStatus={dragOverStatus} draggedProject={draggedProject} handleDragEnd={handleDragEnd} handleDragLeave={handleDragLeave} handleDragOver={handleDragOver} handleDrop={handleDrop} handleDragStart={handleDragStart} keyboardInstructionsId={keyboardInstructionsId} onDelete={onDelete} onEdit={onEdit} onKeyboardMoveProject={handleKeyboardMoveProject} onUpdateStatus={onUpdateStatus} pendingStatusUpdates={pendingStatusUpdates}/>))}
        </div>
      </ScrollArea>
    </div>);
}
function ProjectKanbanColumn({ column, dragOverStatus, draggedProject, handleDragEnd, handleDragLeave, handleDragOver, handleDrop, handleDragStart, keyboardInstructionsId, onDelete, onEdit, onKeyboardMoveProject, onUpdateStatus, pendingStatusUpdates, }: {
    column: {
        status: ProjectStatus;
        label: string;
        items: ProjectRecord[];
    };
    dragOverStatus: ProjectStatus | null;
    draggedProject: DraggedProject | null;
    handleDragEnd: () => void;
    handleDragLeave: () => void;
    handleDragOver: (event: React.DragEvent, status: ProjectStatus) => void;
    handleDrop: (event: React.DragEvent, status: ProjectStatus) => void;
    handleDragStart: (event: React.DragEvent, project: ProjectRecord) => void;
    keyboardInstructionsId: string;
    onDelete: (project: ProjectRecord) => void;
    onEdit: (project: ProjectRecord) => void;
    onKeyboardMoveProject: (project: ProjectRecord, direction: 'previous' | 'next') => void;
    onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void;
    pendingStatusUpdates: Set<string>;
}) {
    const isDragTarget = dragOverStatus === column.status;
    const isDraggingFrom = draggedProject?.sourceStatus === column.status;
    const handleColumnDragOver = (event: React.DragEvent<HTMLDivElement>) => handleDragOver(event, column.status);
    const handleColumnDrop = (event: React.DragEvent<HTMLDivElement>) => handleDrop(event, column.status);
    return (<section aria-label={`${column.label} projects`} className={cn('flex min-w-[17.5rem] max-w-[22rem] flex-1 flex-col rounded-xl border border-border/60 bg-muted/15 shadow-sm transition-colors', isDragTarget && 'border-primary/30 bg-primary/5 ring-1 ring-primary/15', isDraggingFrom && !isDragTarget && 'opacity-60')} onDragOver={handleColumnDragOver} onDragLeave={handleDragLeave} onDrop={handleColumnDrop}>
      <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="size-2.5 rounded-full shadow-sm" style={STATUS_DOT_STYLES[column.status]}/>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {column.label}
          </span>
        </div>
        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-semibold tabular-nums">
          {column.items.length}
        </Badge>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <ul className="list-none space-y-3 p-3">
          {column.items.length === 0 ? (<li className={cn('flex min-h-24 list-none flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-background/60 p-4 text-center', isDragTarget && 'border-primary/35 bg-primary/5')}>
              {draggedProject ? (<>
                  <GripVertical className="mb-1.5 size-5 text-muted-foreground" aria-hidden/>
                  <p className="text-xs font-medium text-muted-foreground">Drop to move here</p>
                </>) : (<>
                  <p className="text-xs font-medium text-muted-foreground">Empty column</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground/70">Drag a project here or use the card menu</p>
                </>)}
            </li>) : (column.items.map((project) => (<KanbanProjectItem key={project.id} draggedProject={draggedProject} handleDragEnd={handleDragEnd} handleDragStart={handleDragStart} keyboardInstructionsId={keyboardInstructionsId} onDelete={onDelete} onEdit={onEdit} onKeyboardMoveProject={onKeyboardMoveProject} onUpdateStatus={onUpdateStatus} pending={pendingStatusUpdates.has(project.id)} project={project} reorderEnabled={canDragProjectKanbanCard(project, pendingStatusUpdates)}/>)))}
        </ul>
      </ScrollArea>
    </section>);
}
function KanbanProjectItem({ draggedProject, handleDragEnd, handleDragStart, keyboardInstructionsId, onDelete, onEdit, onKeyboardMoveProject, onUpdateStatus, pending, project, reorderEnabled, }: {
    draggedProject: DraggedProject | null;
    handleDragEnd: () => void;
    handleDragStart: (event: React.DragEvent, project: ProjectRecord) => void;
    keyboardInstructionsId: string;
    onDelete: (project: ProjectRecord) => void;
    onEdit: (project: ProjectRecord) => void;
    onKeyboardMoveProject: (project: ProjectRecord, direction: 'previous' | 'next') => void;
    onUpdateStatus: (project: ProjectRecord, status: ProjectStatus) => void;
    pending: boolean;
    project: ProjectRecord;
    reorderEnabled: boolean;
}) {
    const isDragging = draggedProject?.id === project.id;
    const onGripDragStart = (event: React.DragEvent<HTMLButtonElement>) => {
        handleDragStart(event, project);
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (!event.altKey)
            return;
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            onKeyboardMoveProject(project, 'previous');
        }
        else if (event.key === 'ArrowRight') {
            event.preventDefault();
            onKeyboardMoveProject(project, 'next');
        }
    };
    return (<li className={cn('list-none', isDragging && 'opacity-40')}>
      <div className="flex items-start gap-1.5">
        {reorderEnabled ? (<button type="button" className="mt-1 flex size-8 shrink-0 cursor-grab items-center justify-center rounded-md border border-border/60 bg-muted/30 text-muted-foreground transition-colors hover:bg-muted/60 active:cursor-grabbing" aria-label={`Move ${project.name} to another status column`} aria-describedby={keyboardInstructionsId} aria-keyshortcuts="Alt+ArrowLeft Alt+ArrowRight" aria-grabbed={isDragging} draggable onDragStart={onGripDragStart} onDragEnd={handleDragEnd} onKeyDown={handleKeyDown}>
            <GripVertical className="size-4" aria-hidden/>
          </button>) : null}
        <div className={cn('min-w-0 flex-1 motion-chromatic', reorderEnabled && 'active:scale-[0.99]')}>
          <ProjectCard project={project} onDelete={onDelete} onEdit={onEdit} onUpdateStatus={onUpdateStatus} isPendingUpdate={pending} compact kanban/>
        </div>
      </div>
    </li>);
}
