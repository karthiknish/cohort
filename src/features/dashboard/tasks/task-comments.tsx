'use client';
import { useTaskCommentsPanel } from './use-task-comments-panel';
import type { TaskCommentsPanelProps } from './task-comments-panel-types';
export type { TaskCommentsPanelProps } from './task-comments-panel-types';
export function TaskCommentsPanel(props: TaskCommentsPanelProps) {
    const { view } = useTaskCommentsPanel(props);
    return view;
}
