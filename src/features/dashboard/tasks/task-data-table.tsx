'use client';
import { createContext, use, useCallback, useMemo, type MouseEvent } from 'react';
import { ArrowDown, ArrowUp, LoaderCircle, Minus, MoreHorizontal, Pencil, Trash2, } from 'lucide-react';
import type { CellContext, ColumnDef, HeaderContext } from '@tanstack/react-table';
import type { TaskRecord, TaskStatus, TaskPriority } from '@/types/tasks';
import { TASK_STATUSES } from '@/types/tasks';
import { Checkbox } from '@/shared/ui/checkbox';
import { Button } from '@/shared/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { DataTable, DataTableColumnHeader } from '@/shared/ui/data-table';
import { cn } from '@/lib/utils';
import { formatDate, formatPriorityLabel, formatStatusLabel, isDueSoon, isOverdue, PRIORITY_ORDER, STATUS_ICONS, statusTablePillClass, } from './task-types';
import { formatTaskKey } from './task-table';
import { useTaskAssigneeLabel } from './task-participants-context';
type TaskDataTableActions = {
    pendingStatusUpdates: Set<string>;
    selectedTaskIds?: Set<string>;
    onOpen: (task: TaskRecord) => void;
    onEdit: (task: TaskRecord) => void;
    onDelete: (task: TaskRecord) => void;
    onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void;
    onSelectToggle?: (taskId: string, checked: boolean) => void;
};
const TaskDataTableActionsContext = createContext<TaskDataTableActions | null>(null);
function useTaskDataTableActions() {
    const context = use(TaskDataTableActionsContext);
    if (!context) {
        throw new Error('TaskDataTableActionsContext is missing');
    }
    return context;
}
function stopRowActivation(event: MouseEvent) {
    event.stopPropagation();
}
function assigneeInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0)
        return '?';
    const first = parts[0];
    if (!first)
        return '?';
    if (parts.length === 1)
        return first.slice(0, 2).toUpperCase();
    const second = parts[1];
    return `${first[0] ?? ''}${second?.[0] ?? ''}`.toUpperCase();
}
function PriorityIndicator({ priority }: {
    priority: TaskPriority;
}) {
    if (priority === 'urgent') {
        return (<span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
        <ArrowUp className="size-3.5" aria-hidden/>
        Highest
      </span>);
    }
    if (priority === 'high') {
        return (<span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
        <ArrowUp className="size-3.5" aria-hidden/>
        High
      </span>);
    }
    if (priority === 'low') {
        return (<span className="inline-flex items-center gap-1 text-xs font-medium text-info">
        <ArrowDown className="size-3.5" aria-hidden/>
        Low
      </span>);
    }
    return (<span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <Minus className="size-3.5" aria-hidden/>
      {formatPriorityLabel(priority)}
    </span>);
}
function TaskSelectHeader() {
    return <span className="sr-only">Select</span>;
}
function TaskSelectCell({ row }: CellContext<TaskRecord, unknown>) {
    const { onSelectToggle, selectedTaskIds } = useTaskDataTableActions();
    const task = row.original;
    const handleChange = (checked: boolean) => {
        onSelectToggle?.(task.id, checked);
    };
    if (!onSelectToggle)
        return null;
    return (<Checkbox checked={selectedTaskIds?.has(task.id) ?? false} onCheckedChange={handleChange} aria-label={`Select ${task.title}`} className="size-4 rounded border-border" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}/>);
}
function TaskKeyHeader({ column }: HeaderContext<TaskRecord, unknown>) {
    return <DataTableColumnHeader column={column} title="Key"/>;
}
function TaskKeyCell({ row }: CellContext<TaskRecord, unknown>) {
    return (<span className="truncate font-mono text-xs text-muted-foreground">{formatTaskKey(row.original.id)}</span>);
}
function TaskSummaryHeader({ column }: HeaderContext<TaskRecord, unknown>) {
    return <DataTableColumnHeader column={column} title="Summary"/>;
}
function TaskSummaryCell({ row }: CellContext<TaskRecord, unknown>) {
    const { pendingStatusUpdates } = useTaskDataTableActions();
    const task = row.original;
    const isPending = pendingStatusUpdates.has(task.id);
    return (<div className="flex min-w-0 items-center gap-2">
      <span className={cn('truncate font-medium text-foreground', task.status === 'completed' && 'text-muted-foreground line-through decoration-border')}>
        {task.title}
      </span>
      {isPending ? (<LoaderCircle className="size-3.5 shrink-0 animate-spin text-muted-foreground" aria-hidden/>) : null}
    </div>);
}
function TaskStatusHeader({ column }: HeaderContext<TaskRecord, unknown>) {
    return <DataTableColumnHeader column={column} title="Status"/>;
}
function TaskStatusCell({ row }: CellContext<TaskRecord, unknown>) {
    const status = row.original.status;
    return (<span className={cn('inline-flex max-w-full items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', statusTablePillClass[status])}>
      {formatStatusLabel(status)}
    </span>);
}
function TaskAssigneeHeader({ column }: HeaderContext<TaskRecord, unknown>) {
    return <DataTableColumnHeader column={column} title="Assignee"/>;
}
function TaskAssigneeCell({ row }: CellContext<TaskRecord, unknown>) {
    const rawAssignee = (row.original.assignedTo ?? [])[0] ?? null;
    const assignee = useTaskAssigneeLabel(rawAssignee ?? '');
    if (!rawAssignee) {
        return <span className="text-xs text-muted-foreground">Unassigned</span>;
    }
    return (<div className="flex min-w-0 items-center gap-2">
      <Avatar className="size-6 shrink-0 border border-border/60">
        <AvatarFallback className="bg-muted text-[10px] font-medium text-muted-foreground">
          {assigneeInitials(assignee)}
        </AvatarFallback>
      </Avatar>
      <span className="truncate text-xs text-foreground">{assignee}</span>
    </div>);
}
function TaskDueDateHeader({ column }: HeaderContext<TaskRecord, unknown>) {
    return <DataTableColumnHeader column={column} title="Due date"/>;
}
function TaskDueDateCell({ row }: CellContext<TaskRecord, unknown>) {
    const task = row.original;
    const overdue = isOverdue(task);
    const dueSoon = isDueSoon(task);
    const dueLabel = task.dueDate ? formatDate(task.dueDate) : '—';
    return (<span className={cn('text-xs tabular-nums', overdue ? 'font-medium text-destructive' : dueSoon ? 'text-warning' : 'text-muted-foreground')}>
      {dueLabel}
    </span>);
}
function TaskPriorityHeader({ column }: HeaderContext<TaskRecord, unknown>) {
    return <DataTableColumnHeader column={column} title="Priority"/>;
}
function TaskPriorityCell({ row }: CellContext<TaskRecord, unknown>) {
    return <PriorityIndicator priority={row.original.priority}/>;
}
function TaskActionsHeader() {
    return <div className="text-right">
    <span className="sr-only">Actions</span>
  </div>;
}
function TaskStatusMenuItem({ task, status, onQuickStatusChange, }: {
    task: TaskRecord;
    status: TaskStatus;
    onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void;
}) {
    const onQuickStatusSelect = () => {
        onQuickStatusChange(task, status);
    };
    const NextStatusIcon = STATUS_ICONS[status];
    return (<DropdownMenuItem onClick={onQuickStatusSelect}>
      <NextStatusIcon className="mr-2 size-4"/>
      {formatStatusLabel(status)}
    </DropdownMenuItem>);
}
function TaskActionsCell({ row }: CellContext<TaskRecord, unknown>) {
    const { onEdit, onDelete, onQuickStatusChange } = useTaskDataTableActions();
    const task = row.original;
    const handleEdit = () => {
        onEdit(task);
    };
    const handleDelete = () => {
        onDelete(task);
    };
    return (<div className="flex justify-end" onPointerDown={stopRowActivation}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7 text-muted-foreground" aria-label={`Actions for ${task.title}`}>
            <MoreHorizontal className="size-4"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {TASK_STATUSES.flatMap((status) => status !== task.status
            ? [(<TaskStatusMenuItem key={status} task={task} status={status} onQuickStatusChange={onQuickStatusChange}/>)]
            : [])}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEdit}>
            <Pencil className="mr-2 size-4"/>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 size-4"/>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>);
}
function createTaskColumns(showSelection: boolean): ColumnDef<TaskRecord>[] {
    const columns: ColumnDef<TaskRecord>[] = [];
    if (showSelection) {
        columns.push({
            id: 'select',
            header: TaskSelectHeader,
            cell: TaskSelectCell,
            enableSorting: false,
            enableHiding: false,
            size: 44,
        });
    }
    columns.push({
        id: 'key',
        accessorFn: (task) => formatTaskKey(task.id),
        header: TaskKeyHeader,
        cell: TaskKeyCell,
        enableSorting: true,
        size: 96,
    }, {
        accessorKey: 'title',
        header: TaskSummaryHeader,
        cell: TaskSummaryCell,
        enableSorting: true,
        size: 280,
    }, {
        accessorKey: 'status',
        header: TaskStatusHeader,
        cell: TaskStatusCell,
        enableSorting: true,
        size: 120,
    }, {
        id: 'assignee',
        accessorFn: (task) => (task.assignedTo ?? [])[0] ?? '',
        header: TaskAssigneeHeader,
        cell: TaskAssigneeCell,
        enableSorting: true,
        size: 152,
    }, {
        accessorKey: 'dueDate',
        header: TaskDueDateHeader,
        cell: TaskDueDateCell,
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
            const a = rowA.original.dueDate;
            const b = rowB.original.dueDate;
            if (!a && !b)
                return 0;
            if (!a)
                return 1;
            if (!b)
                return -1;
            return a.localeCompare(b);
        },
        size: 104,
    }, {
        accessorKey: 'priority',
        header: TaskPriorityHeader,
        cell: TaskPriorityCell,
        enableSorting: true,
        sortingFn: (rowA, rowB) => PRIORITY_ORDER[rowA.original.priority] - PRIORITY_ORDER[rowB.original.priority],
        size: 104,
    }, {
        id: 'actions',
        header: TaskActionsHeader,
        cell: TaskActionsCell,
        enableSorting: false,
        enableHiding: false,
        size: 56,
    });
    return columns;
}
export type TaskDataTableProps = {
    tasks: TaskRecord[];
    pendingStatusUpdates: Set<string>;
    onOpen: (task: TaskRecord) => void;
    onEdit: (task: TaskRecord) => void;
    onDelete: (task: TaskRecord) => void;
    onQuickStatusChange: (task: TaskRecord, newStatus: TaskStatus) => void;
    selectedTaskIds?: Set<string>;
    onSelectToggle?: (taskId: string, checked: boolean) => void;
    loading?: boolean;
    className?: string;
};
export function TaskDataTable({ tasks, pendingStatusUpdates, onOpen, onEdit, onDelete, onQuickStatusChange, selectedTaskIds, onSelectToggle, loading = false, className, }: TaskDataTableProps) {
    const showSelection = Boolean(onSelectToggle);
    const columns = createTaskColumns(showSelection);
    const actions = useMemo(() => ({
        pendingStatusUpdates,
        selectedTaskIds,
        onOpen,
        onEdit,
        onDelete,
        onQuickStatusChange,
        onSelectToggle,
    }), [pendingStatusUpdates, selectedTaskIds, onOpen, onEdit, onDelete, onQuickStatusChange, onSelectToggle]);
    const rowClassName = (task: TaskRecord) => cn(pendingStatusUpdates.has(task.id) && 'pointer-events-none opacity-60', selectedTaskIds?.has(task.id) && 'bg-primary/4', task.status === 'completed' && 'opacity-90');
    const getRowId = (task: TaskRecord) => task.id;
    const handleRowClick = (task: TaskRecord) => {
        onOpen(task);
    };
    return (<TaskDataTableActionsContext value={actions}>
      <DataTable className={cn('rounded-none border-0 shadow-none', className)} columns={columns} data={tasks} getRowId={getRowId} loading={loading} loadingRows={5} onRowClick={handleRowClick} rowClassName={rowClassName} showPagination={false} stickyHeader/>
    </TaskDataTableActionsContext>);
}
