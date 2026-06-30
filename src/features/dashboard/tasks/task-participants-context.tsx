'use client';
import { createContext, use, useMemo, type ReactNode } from 'react';
import type { TaskParticipant } from './task-types';
import { formatAssigneeList, resolveAssigneeLabel } from './task-types';
const EMPTY_PARTICIPANTS: TaskParticipant[] = [];
const TaskParticipantsContext = createContext<TaskParticipant[]>(EMPTY_PARTICIPANTS);
export function TaskParticipantsProvider({ participants, children, }: {
    participants: TaskParticipant[];
    children: ReactNode;
}) {
    const value = useMemo(() => participants, [participants]);
    return (<TaskParticipantsContext.Provider value={value}>
      {children}
    </TaskParticipantsContext.Provider>);
}
export function useTaskParticipants(): TaskParticipant[] {
    return use(TaskParticipantsContext);
}
export function useTaskAssigneeLabel(value: string): string {
    const participants = useTaskParticipants();
    return resolveAssigneeLabel(value, participants);
}
export function useTaskAssigneeList(assignees: string[] | null | undefined): string {
    const participants = useTaskParticipants();
    return formatAssigneeList(assignees ?? [], participants);
}
