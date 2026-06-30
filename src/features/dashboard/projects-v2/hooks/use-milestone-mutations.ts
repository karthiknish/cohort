'use client';

import { useCallback } from 'react';
import { useMutation } from 'convex/react';
import { projectMilestonesApi } from '@/lib/convex-api';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { logError } from '@/lib/convex-errors';
import type { MilestoneRecord } from '@/types/milestones';

export type UseMilestoneMutationsArgs = {
  workspaceId: string | null;
  isPreviewMode: boolean;
  onMilestoneUpdated?: (milestone: MilestoneRecord) => void;
};

export function useMilestoneMutations({
  workspaceId,
  isPreviewMode,
  onMilestoneUpdated,
}: UseMilestoneMutationsArgs) {
  const updateMilestone = useMutation(projectMilestonesApi.update);

  const moveMilestone = useCallback(
    async (milestone: MilestoneRecord, startDate: Date, endDate: Date | null) => {
      if (isPreviewMode || !workspaceId) {
        onMilestoneUpdated?.({
          ...milestone,
          startDate: startDate.toISOString(),
          endDate: endDate ? endDate.toISOString() : null,
        });
        return;
      }
      try {
        await updateMilestone({
          workspaceId,
          projectId: milestone.projectId,
          legacyId: milestone.id,
          startDateMs: startDate.getTime(),
          endDateMs: endDate ? endDate.getTime() : null,
          updatedAtMs: Date.now(),
        });
        onMilestoneUpdated?.({
          ...milestone,
          startDate: startDate.toISOString(),
          endDate: endDate ? endDate.toISOString() : null,
        });
        notifySuccess({ message: 'Milestone rescheduled' });
      } catch (error) {
        logError(error, 'moveMilestone');
        notifyFailure({
          title: 'Could not reschedule milestone',
          message: 'Unable to update the milestone dates. Please try again.',
        });
      }
    },
    [updateMilestone, workspaceId, isPreviewMode, onMilestoneUpdated],
  );

  const updateMilestoneDetails = useCallback(
    async (
      milestone: MilestoneRecord,
      patch: {
        title?: string;
        status?: string;
        description?: string | null;
        startDateMs?: number | null;
        endDateMs?: number | null;
      },
    ) => {
      if (isPreviewMode || !workspaceId) {
        onMilestoneUpdated?.({
          ...milestone,
          ...('title' in patch && patch.title !== undefined ? { title: patch.title } : {}),
          ...('status' in patch && patch.status !== undefined ? { status: patch.status as MilestoneRecord['status'] } : {}),
          ...('description' in patch && patch.description !== undefined ? { description: patch.description } : {}),
          ...('startDateMs' in patch && patch.startDateMs !== undefined
            ? { startDate: patch.startDateMs ? new Date(patch.startDateMs).toISOString() : null }
            : {}),
          ...('endDateMs' in patch && patch.endDateMs !== undefined
            ? { endDate: patch.endDateMs ? new Date(patch.endDateMs).toISOString() : null }
            : {}),
        });
        return;
      }
      try {
        await updateMilestone({
          workspaceId,
          projectId: milestone.projectId,
          legacyId: milestone.id,
          ...patch,
          updatedAtMs: Date.now(),
        });
        onMilestoneUpdated?.({
          ...milestone,
          ...('title' in patch && patch.title !== undefined ? { title: patch.title } : {}),
          ...('status' in patch && patch.status !== undefined ? { status: patch.status as MilestoneRecord['status'] } : {}),
          ...('description' in patch && patch.description !== undefined ? { description: patch.description } : {}),
          ...('startDateMs' in patch && patch.startDateMs !== undefined
            ? { startDate: patch.startDateMs ? new Date(patch.startDateMs).toISOString() : null }
            : {}),
          ...('endDateMs' in patch && patch.endDateMs !== undefined
            ? { endDate: patch.endDateMs ? new Date(patch.endDateMs).toISOString() : null }
            : {}),
        });
        notifySuccess({ message: 'Milestone updated' });
      } catch (error) {
        logError(error, 'updateMilestoneDetails');
        notifyFailure({
          title: 'Could not update milestone',
          message: 'Unable to update the milestone. Please try again.',
        });
      }
    },
    [updateMilestone, workspaceId, isPreviewMode, onMilestoneUpdated],
  );

  return { moveMilestone, updateMilestoneDetails };
}
