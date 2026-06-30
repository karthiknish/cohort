'use client';
import { useCallback } from 'react';
import { useMutation } from 'convex/react';
import { tasksApi } from '@/lib/convex-api';
export function useAgentTaskUndo(workspaceId: string | null) {
    const softDeleteTask = useMutation(tasksApi.softDeleteTask);
    const undoTask = async (resourceId: string) => {
        if (!workspaceId)
            return;
        await softDeleteTask({ workspaceId, legacyId: resourceId });
    };
    return { undoTask };
}
