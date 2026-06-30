'use client';

import { useQuery, useMutation } from 'convex/react';
import { collaborationApi } from '@/lib/convex-api';
import { usePreview } from '@/shared/contexts/preview-context';
import type { Channel } from '../types';

type UnreadCountsResponse = {
  countsByChannelId?: Record<string, number>;
  totalUnread?: number;
};

type ThreadUnreadResponse = {
  countsByThreadRootId?: Record<string, number>;
};

export function useChannelUnreadCounts(workspaceId: string | null, currentUserId: string | null) {
  const { isPreviewMode } = usePreview();
  const enabled = !isPreviewMode && Boolean(workspaceId) && Boolean(currentUserId);

  const result = useQuery(
    collaborationApi.getUnreadCountsByChannel,
    enabled ? { workspaceId: String(workspaceId), userId: String(currentUserId) } : 'skip',
  ) as UnreadCountsResponse | undefined;

  const counts: Record<string, number> = {};
  const source = result?.countsByChannelId;
  if (source && typeof source === 'object') {
    for (const [channelId, count] of Object.entries(source)) {
      counts[channelId] = Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
    }
  }
  return counts;
}

export function useThreadUnreadCounts(
  workspaceId: string | null,
  currentUserId: string | null,
  channel: Channel | null,
  threadRootIds: string[],
) {
  const { isPreviewMode } = usePreview();
  const enabled = !isPreviewMode && Boolean(workspaceId) && Boolean(currentUserId) && Boolean(channel) && threadRootIds.length > 0;

  const result = useQuery(
    collaborationApi.getThreadUnreadCounts,
    enabled
      ? {
          workspaceId: String(workspaceId),
          channelId: channel!.isCustom ? channel!.id : null,
          channelType: channel!.type,
          clientId: channel!.type === 'client' ? (channel!.clientId ?? null) : null,
          projectId: channel!.type === 'project' ? (channel!.projectId ?? null) : null,
          threadRootIds,
          userId: String(currentUserId),
        }
      : 'skip',
  ) as ThreadUnreadResponse | undefined;

  const counts: Record<string, number> = {};
  const source = result?.countsByThreadRootId;
  if (source && typeof source === 'object') {
    for (const [rootId, count] of Object.entries(source)) {
      counts[rootId] = Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
    }
  }
  return counts;
}

export function useMarkChannelAsRead() {
  return useMutation(collaborationApi.markChannelAsRead);
}

export function useMarkMessageAsRead() {
  return useMutation(collaborationApi.markAsRead);
}
