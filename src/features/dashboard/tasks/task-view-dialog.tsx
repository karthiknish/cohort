'use client';
import { useState } from 'react';
import type { TaskRecord, TaskStatus } from '@/types/tasks';
import { Dialog, DialogContent } from '@/shared/ui/dialog';
import { Tabs } from '@/shared/ui/tabs';
import { TASKS_THEME } from './tasks-theme';
import type { TaskParticipant } from './task-types';
import { useTaskCommentsPanel } from './use-task-comments-panel';
import { TaskViewCommentsTab, TaskViewDetailsTab, TaskViewDialogFooter, TaskViewDialogHeader, TaskViewDialogTabsList, } from './task-view-dialog-sections';
type TaskViewDialogProps = {
    task: TaskRecord | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onEdit?: (task: TaskRecord) => void;
    onDelete?: (task: TaskRecord) => void;
    onQuickStatusChange?: (task: TaskRecord, newStatus: TaskStatus) => void;
    initialTab?: 'details' | 'comments';
    workspaceId?: string | null;
    userId?: string | null;
    userName?: string | null;
    userRole?: string | null;
    participants?: TaskParticipant[];
};
const EMPTY_PARTICIPANTS: TaskParticipant[] = [];
export function TaskViewDialog({ task, open, onOpenChange, onEdit, onDelete, onQuickStatusChange, initialTab = 'details', workspaceId = null, userId = null, userName = null, userRole = null, participants = EMPTY_PARTICIPANTS, }: TaskViewDialogProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details');
    const taskId = task?.id ?? '';
    const { view: commentsPanel, commentCount, loading: commentsLoading } = useTaskCommentsPanel({
        taskId,
        workspaceId,
        userId,
        userName,
        userRole,
        participants,
    });
    const liveCommentCount = commentsLoading ? (task?.commentCount ?? 0) : commentCount;
    const handleDialogOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setActiveTab(initialTab);
        }
        else {
            setActiveTab('details');
        }
        onOpenChange(nextOpen);
    };
    const handleFooterClose = () => {
        onOpenChange(false);
    };
    const handleEdit = () => {
        if (!task || !onEdit)
            return;
        onOpenChange(false);
        onEdit(task);
    };
    const handleDelete = () => {
        if (!task || !onDelete)
            return;
        onOpenChange(false);
        onDelete(task);
    };
    const handleQuickStatusChange = (newStatus: TaskStatus) => {
        if (!task || !onQuickStatusChange)
            return;
        onQuickStatusChange(task, newStatus);
    };
    const handleMarkComplete = () => {
        if (!task || !onQuickStatusChange)
            return;
        onQuickStatusChange(task, 'completed');
    };
    const handleTabChange = (value: string) => {
        setActiveTab(value as 'details' | 'comments');
    };
    if (!task)
        return null;
    const canMarkComplete = task.status !== 'completed' && task.status !== 'archived';
    return (<Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className={TASKS_THEME.viewDialog.shell}>
        <TaskViewDialogHeader title={task.title} status={task.status} priority={task.priority} client={task.client} assignedTo={task.assignedTo} dueDate={task.dueDate} timeSpentMinutes={task.timeSpentMinutes} onEdit={onEdit ? handleEdit : undefined} onDelete={onDelete ? handleDelete : undefined} onQuickStatusChange={onQuickStatusChange ? handleQuickStatusChange : undefined}/>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className={TASKS_THEME.viewDialog.tabsRail}>
            <TaskViewDialogTabsList commentCount={liveCommentCount}/>
          </div>

          <div className={TASKS_THEME.viewDialog.body}>
            <TaskViewDetailsTab task={task}/>
            <TaskViewCommentsTab commentsPanel={commentsPanel}/>
          </div>
        </Tabs>

        <TaskViewDialogFooter onClose={handleFooterClose} onEdit={onEdit ? handleEdit : undefined} onMarkComplete={onQuickStatusChange && canMarkComplete ? handleMarkComplete : undefined}/>
      </DialogContent>
    </Dialog>);
}
