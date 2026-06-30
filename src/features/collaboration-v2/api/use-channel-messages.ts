'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useConvex } from 'convex/react';
import { collaborationApi } from '@/lib/convex-api';
import { usePreview } from '@/shared/contexts/preview-context';
import type { Channel, CollaborationMessage } from '../types';
import { mapChannelMessageRow } from '../utils/message-mappers';

type ListChannelArgs = {
  workspaceId: string;
  channel: Channel;
  limit?: number;
  cursor?: { legacyId: string; fieldValue: number } | null;
};

type RawListResponse = {
  items: Array<Record<string, unknown>>;
  nextCursor: { legacyId: string; fieldValue: number } | null;
};

type ChannelKey = string;

export function useChannelMessages(workspaceId: string | null, channel: Channel | null, limit = 51) {
  const { isPreviewMode } = usePreview();
  const convex = useConvex();
  const enabled = !isPreviewMode && Boolean(workspaceId) && Boolean(channel);

  // Track the channel key so we can reset accumulated pages when switching channels
  const channelKey: ChannelKey = channel ? `${channel.type}:${channel.id}` : '';

  // Accumulated older pages (each page is the raw items from Convex)
  const [olderPages, setOlderPages] = useState<RawListResponse[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const lastChannelKeyRef = useRef<ChannelKey>(channelKey);

  // Reset accumulated pages when the channel changes
  useEffect(() => {
    if (lastChannelKeyRef.current === channelKey) return;
    lastChannelKeyRef.current = channelKey;
    setOlderPages([]);
  }, [channelKey]);

  // Latest page (most recent messages) — always fetched without a cursor
  const result = useQuery(
    collaborationApi.listChannel,
    enabled
      ? {
          workspaceId: String(workspaceId),
          channelId: channel!.isCustom ? channel!.id : null,
          channelType: channel!.type,
          clientId: channel!.type === 'client' ? (channel!.clientId ?? null) : null,
          projectId: channel!.type === 'project' ? (channel!.projectId ?? null) : null,
          limit,
        }
      : 'skip',
  ) as RawListResponse | undefined;

  // The cursor for the next "load more" is the nextCursor of the last accumulated page
  // (or the latest page's nextCursor if no older pages have been loaded yet)
  const lastPageNextCursor =
    olderPages.length > 0
      ? (olderPages[olderPages.length - 1]?.nextCursor ?? null)
      : (result?.nextCursor ?? null);

  const hasMore = Boolean(lastPageNextCursor);

  const loadMore = useCallback(async () => {
    if (!enabled || !lastPageNextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = (await convex.query(collaborationApi.listChannel, {
        workspaceId: String(workspaceId),
        channelId: channel!.isCustom ? channel!.id : null,
        channelType: channel!.type,
        clientId: channel!.type === 'client' ? (channel!.clientId ?? null) : null,
        projectId: channel!.type === 'project' ? (channel!.projectId ?? null) : null,
        limit,
        cursor: lastPageNextCursor,
      })) as RawListResponse;
      setOlderPages((prev) => [...prev, res]);
    } finally {
      setLoadingMore(false);
    }
  }, [convex, enabled, lastPageNextCursor, loadingMore, workspaceId, channel, limit]);

  // Combine: older pages (oldest first) + latest page (most recent)
  const allRawItems = [...olderPages.flatMap((p) => p.items), ...(result?.items ?? [])];

  const messages: CollaborationMessage[] = allRawItems
    .flatMap((row) => {
      const msg = mapChannelMessageRow(row, { fallbackChannelType: channel?.type ?? 'team' });
      return msg ? [msg] : [];
    })
    .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());

  return {
    messages,
    isLoading: result === undefined && enabled,
    hasMore,
    loadingMore,
    loadMore,
  };
}

export function useSendChannelMessage() {
  return useMutation(collaborationApi.createMessage);
}

export function useEditChannelMessage() {
  return useMutation(collaborationApi.updateMessage);
}

export function useDeleteChannelMessage() {
  return useMutation(collaborationApi.softDeleteMessage);
}

export function useToggleChannelReaction() {
  return useMutation(collaborationApi.toggleReaction);
}

export function useVoteChannelPoll() {
  return useMutation(collaborationApi.voteOnPoll);
}

export function useEndChannelPoll() {
  return useMutation(collaborationApi.endPollMessage);
}

export function useUpdateSharedTo() {
  return useMutation(collaborationApi.updateSharedTo);
}
