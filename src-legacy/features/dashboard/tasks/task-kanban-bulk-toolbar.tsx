'use client';
import { useCallback, useState } from 'react';
import { CheckSquare, X, Trash2, User, Calendar, LoaderCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Popover, PopoverContent, PopoverTrigger, } from '@/shared/ui/popover';
import { TASK_STATUSES } from '@/types/tasks';
import type { TaskStatus } from '@/types/tasks';
import { formatStatusLabel } from './task-types';
type TaskKanbanBulkToolbarProps = {
    selectedCount: number;
    totalVisible: number;
    bulkActive: boolean;
    bulkLabel: string;
    bulkProgress: number;
    onSelectAll: () => void;
    onClearSelection: () => void;
    onBulkStatusChange?: (status: TaskStatus) => void;
    onBulkAssign?: (assignees: string[]) => void;
    onBulkDueDate?: (date: string | null) => void;
    onBulkDelete?: () => void;
};
export function TaskKanbanBulkToolbar({ selectedCount, totalVisible, bulkActive, bulkLabel, bulkProgress, onSelectAll, onClearSelection, onBulkStatusChange, onBulkAssign, onBulkDueDate, onBulkDelete, }: TaskKanbanBulkToolbarProps) {
    const [assigneeInput, setAssigneeInput] = useState('');
    const handleAssigneeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAssigneeInput(e.target.value);
    };
    const handleBulkAssign = () => {
        if (!onBulkAssign || !assigneeInput.trim())
            return;
        onBulkAssign(assigneeInput.split(',').map((name) => name.trim()));
        setAssigneeInput('');
    };
    const handleAssigneeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== 'Enter')
            return;
        e.preventDefault();
        handleBulkAssign();
    };
    const handleClearDueDate = () => {
        onBulkDueDate?.(null);
    };
    const handleSetToday = () => {
        onBulkDueDate?.(new Date().toISOString().split('T')[0]!);
    };
    const handleSetTomorrow = () => {
        onBulkDueDate?.(new Date(Date.now() + 86400000).toISOString().split('T')[0]!);
    };
    const handleSetNextWeek = () => {
        onBulkDueDate?.(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]!);
    };
    if (selectedCount === 0 && !bulkActive) {
        return (<div className="flex items-center justify-between px-1 py-2 border-b border-muted/20">
        <button type="button" onClick={onSelectAll} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <CheckSquare className="size-3.5"/>
          Select all visible
        </button>
        <span className="text-xs text-muted-foreground">
          {totalVisible} {totalVisible === 1 ? 'task' : 'tasks'}
        </span>
      </div>);
    }
    return (<div className="flex items-center justify-between gap-3 px-1 py-2 border-b border-muted/20 bg-accent/5">
      <div className="flex items-center gap-3">
        {bulkActive ? (<div className="flex items-center gap-2 text-sm">
            <LoaderCircle className="size-4 animate-spin text-primary"/>
            <span className="font-medium">{bulkLabel}...</span>
            <Badge variant="outline" className="h-5">
              {bulkProgress}%
            </Badge>
          </div>) : (<>
            <div className="flex items-center gap-2">
              <CheckSquare className="size-4 text-primary"/>
              <span className="text-sm font-medium">
                {selectedCount} {selectedCount === 1 ? 'task' : 'tasks'} selected
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={onSelectAll} className="h-7 text-xs" disabled={selectedCount === totalVisible}>
              Select all ({totalVisible})
            </Button>
            <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-7 text-xs">
              <X className="size-3 mr-1"/>
              Clear
            </Button>
          </>)}
      </div>

      {!bulkActive && (<div className="flex items-center gap-1.5">
          {/* Bulk status change */}
          {onBulkStatusChange && (<Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs">
                  Set Status
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-1" align="end">
                {TASK_STATUSES.flatMap((status) => status !== 'archived' ? [(<BulkStatusOption key={status} status={status} onSelect={onBulkStatusChange}/>)] : [])}
              </PopoverContent>
            </Popover>)}

          {/* Bulk assign */}
          {onBulkAssign && (<Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <User className="size-3"/>
                  Assign
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3" align="end">
                <div className="space-y-2">
                  <p className="text-xs font-medium">Assign to (comma-separated names)</p>
                  <input type="text" aria-label="Assign to (comma-separated names)" placeholder="Alice, Bob, …" value={assigneeInput} onChange={handleAssigneeInputChange} className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm" onKeyDown={handleAssigneeKeyDown}/>
                  <Button size="sm" onClick={handleBulkAssign} className="w-full h-7">
                    Assign
                  </Button>
                </div>
              </PopoverContent>
            </Popover>)}

          {/* Bulk due date */}
          {onBulkDueDate && (<Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <Calendar className="size-3"/>
                  Due Date
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1" align="end">
                <button type="button" onClick={handleClearDueDate} className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
                  Clear due date
                </button>
                <button type="button" onClick={handleSetToday} className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
                  Today
                </button>
                <button type="button" onClick={handleSetTomorrow} className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
                  Tomorrow
                </button>
                <button type="button" onClick={handleSetNextWeek} className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
                  Next week
                </button>
              </PopoverContent>
            </Popover>)}

          {/* Bulk delete */}
          {onBulkDelete && (<Button variant="outline" size="sm" onClick={onBulkDelete} className="h-7 text-xs text-destructive hover:text-destructive gap-1">
              <Trash2 className="size-3"/>
              Delete
            </Button>)}
        </div>)}
    </div>);
}
interface BulkStatusOptionProps {
    status: TaskStatus;
    onSelect?: (status: TaskStatus) => void;
}
function BulkStatusOption({ status, onSelect }: BulkStatusOptionProps) {
    const onSelectBulkStatus = () => {
        onSelect?.(status);
    };
    return (<button type="button" onClick={onSelectBulkStatus} className="w-full text-left px-2 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
      {formatStatusLabel(status)}
    </button>);
}
