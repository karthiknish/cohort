'use client';
import { useEffect, useEffectEvent, useMemo, useRef } from 'react';
import type { TaskRecord } from '@/types/tasks';
type KeyboardNavigationOptions = {
    tasks: TaskRecord[];
    selectedTaskId: string | null;
    onTaskSelect: (taskId: string) => void;
    onTaskEdit?: (task: TaskRecord) => void;
    onTaskDelete?: (task: TaskRecord) => void;
    onStatusChange?: (task: TaskRecord, status: string) => void;
    onQuickAdd?: () => void;
    enabled?: boolean;
};
type ShortcutAction = {
    key: string;
    description: string;
    action: () => void;
    condition?: () => boolean;
};
export function useTaskKeyboardNavigation({ tasks, selectedTaskId, onTaskSelect, onTaskEdit, onTaskDelete, onStatusChange, onQuickAdd, enabled = true, }: KeyboardNavigationOptions) {
    const selectedIndexRef = useRef(0);
    const currentIndex = tasks.findIndex((task) => task.id === selectedTaskId);
    const syncSelectedIndex = useEffectEvent(() => {
        if (currentIndex !== -1) {
            selectedIndexRef.current = currentIndex;
        }
    });
    useEffect(() => {
        syncSelectedIndex();
    }, [currentIndex]);
    const getSelectedTask = useEffectEvent((): TaskRecord | null => {
        if (!selectedTaskId)
            return null;
        return tasks.find((task) => task.id === selectedTaskId) ?? null;
    });
    const isSelected = useEffectEvent(() => !!selectedTaskId);
    const hasQuickAdd = useEffectEvent(() => !!onQuickAdd);
    const quickAdd = useEffectEvent(() => {
        onQuickAdd?.();
    });
    const selectNext = useEffectEvent(() => {
        const newIndex = Math.min(selectedIndexRef.current + 1, tasks.length - 1);
        const task = tasks[newIndex];
        if (newIndex >= 0 && task) {
            selectedIndexRef.current = newIndex;
            onTaskSelect(task.id);
        }
    });
    const selectPrevious = useEffectEvent(() => {
        const newIndex = Math.max(selectedIndexRef.current - 1, 0);
        const task = tasks[newIndex];
        if (newIndex >= 0 && task) {
            selectedIndexRef.current = newIndex;
            onTaskSelect(task.id);
        }
    });
    const selectFirst = useEffectEvent(() => {
        const task = tasks[0];
        if (task) {
            selectedIndexRef.current = 0;
            onTaskSelect(task.id);
        }
    });
    const selectLast = useEffectEvent(() => {
        const task = tasks[tasks.length - 1];
        if (task) {
            selectedIndexRef.current = tasks.length - 1;
            onTaskSelect(task.id);
        }
    });
    const editSelected = useEffectEvent(() => {
        const task = getSelectedTask();
        if (task && onTaskEdit) {
            onTaskEdit(task);
        }
    });
    const deleteSelected = useEffectEvent(() => {
        const task = getSelectedTask();
        if (task && onTaskDelete) {
            onTaskDelete(task);
        }
    });
    const cycleStatus = useEffectEvent(() => {
        const task = getSelectedTask();
        if (task && onStatusChange) {
            const statuses: string[] = ['todo', 'in-progress', 'review', 'completed'];
            const currentIndex = statuses.indexOf(task.status ?? 'todo');
            const nextStatus = statuses[(currentIndex + 1) % statuses.length] ?? 'todo';
            onStatusChange(task, nextStatus);
        }
    });
    useEffect(() => {
        if (!enabled)
            return;
        const shortcuts: ShortcutAction[] = [
            { key: 'j', description: 'Move down', action: selectNext },
            { key: 'k', description: 'Move up', action: selectPrevious },
            { key: 'ArrowDown', description: 'Move down', action: selectNext },
            { key: 'ArrowUp', description: 'Move up', action: selectPrevious },
            { key: 'Home', description: 'First task', action: selectFirst },
            { key: 'End', description: 'Last task', action: selectLast },
            { key: 'Enter', description: 'Edit task', action: editSelected, condition: isSelected },
            { key: 'e', description: 'Edit task', action: editSelected, condition: isSelected },
            { key: 'Backspace', description: 'Delete task', action: deleteSelected, condition: isSelected },
            { key: 'Delete', description: 'Delete task', action: deleteSelected, condition: isSelected },
            { key: 's', description: 'Cycle status', action: cycleStatus, condition: isSelected },
            { key: 'n', description: 'New task', action: quickAdd, condition: hasQuickAdd },
            {
                key: 'c',
                description: 'Focus search',
                action: () => {
                    const el = document.getElementById('task-search');
                    if (el)
                        el.focus();
                },
            },
        ];
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input, textarea, or contenteditable
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable ||
                target.closest('[contenteditable="true"]')) {
                return;
            }
            // Find matching shortcut
            const shortcut = shortcuts.find((s) => s.key === e.key || s.key.toLowerCase() === e.key.toLowerCase());
            if (shortcut) {
                // Check condition if present
                if (shortcut.condition && !shortcut.condition()) {
                    return;
                }
                e.preventDefault();
                shortcut.action();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled]);
    const selectedTask = useMemo(() => {
        if (!selectedTaskId)
            return null;
        return tasks.find((task) => task.id === selectedTaskId) ?? null;
    }, [tasks, selectedTaskId]);
    return {
        selectedTask,
        shortcuts: KEYBOARD_SHORTCUTS,
    };
}
// Export shortcuts array for use in components
export const KEYBOARD_SHORTCUTS = [
    { key: '↑ / k', description: 'Move up' },
    { key: '↓ / j', description: 'Move down' },
    { key: 'Enter / e', description: 'Edit task' },
    { key: 's', description: 'Cycle status' },
    { key: 'n', description: 'New task' },
    { key: 'c', description: 'Focus search' },
];
