'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useConvex } from 'convex/react';
import { api, directMessagesApi } from '@/lib/convex-api';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { notifyFailure } from '@/lib/notifications';
import { usePreview } from '@/shared/contexts/preview-context';
import type { DirectConversation, DirectMessage } from '../types';
import { mapDirectConversationRow, mapDirectMessageRow } from '../utils/message-mappers';

type RawConversation = {
  _id: string;
  legacyId: string;
  otherParticipantId: string;
  otherParticipantName: string;
  otherParticipantRole?: string | null;
  lastMessageSnippet?: string | null;
  lastMessageAtMs?: number | null;
  lastMessageSenderId?: string | null;
  isRead?: boolean;
  unreadCount?: number;
  isArchived?: boolean;
  isMuted?: boolean;
  createdAtMs?: number;
  updatedAtMs?: number;
};

type RawMessageListResponse = {
  items: Array<Record<string, unknown>>;
  nextCursor: { legacyId: string; fieldValue: number } | null;
};

type ListDmArgs = {
  workspaceId: string;
  conversationLegacyId: string;
  limit?: number;
  cursor?: { legacyId: string; fieldValue: number } | null;
};

export function useDirectConversations(workspaceId: string | null) {
  const { isPreviewMode } = usePreview();
  const result = useQuery(
    api.directMessages.listConversations,
    !isPreviewMode && workspaceId ? { workspaceId, includeArchived: false } : 'skip',
  ) as RawConversation[] | undefined;

  const conversations: DirectConversation[] = (result ?? []).map((row) =>
    mapDirectConversationRow(row as Parameters<typeof mapDirectConversationRow>[0]),
  );
  return { conversations, isLoading: result === undefined && !isPreviewMode && Boolean(workspaceId) };
}

export function useDirectMessages(
  workspaceId: string | null,
  conversationLegacyId: string | null,
  limit = 51,
) {
  const { isPreviewMode } = usePreview();
  const convex = useConvex();
  const enabled = !isPreviewMode && Boolean(workspaceId) && Boolean(conversationLegacyId);

  const convKey = conversationLegacyId ?? '';

  const [olderPages, setOlderPages] = useState<RawMessageListResponse[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const lastConvKeyRef = useRef<string>(convKey);

  useEffect(() => {
    if (lastConvKeyRef.current === convKey) return;
    lastConvKeyRef.current = convKey;
    setOlderPages([]);
  }, [convKey]);

  const result = useQuery(
    api.directMessages.listMessages,
    enabled
      ? { workspaceId: String(workspaceId), conversationLegacyId: conversationLegacyId!, limit }
      : 'skip',
  ) as RawMessageListResponse | undefined;

  const lastPageNextCursor =
    olderPages.length > 0
      ? (olderPages[olderPages.length - 1]?.nextCursor ?? null)
      : (result?.nextCursor ?? null);

  const hasMore = Boolean(lastPageNextCursor);

  const loadMore = useCallback(async () => {
    if (!enabled || !lastPageNextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = (await convex.query(api.directMessages.listMessages, {
        workspaceId: String(workspaceId),
        conversationLegacyId: conversationLegacyId!,
        limit,
        cursor: lastPageNextCursor,
      } as ListDmArgs)) as RawMessageListResponse;
      setOlderPages((prev) => [...prev, res]);
    } catch (error) {
      logError(error, 'useDirectMessages:loadMore');
      notifyFailure({
        title: 'Failed to load older messages',
        message: asErrorMessage(error),
      });
    } finally {
      setLoadingMore(false);
    }
  }, [convex, enabled, lastPageNextCursor, loadingMore, workspaceId, conversationLegacyId, limit]);

  const allRawItems = [...olderPages.flatMap((p) => p.items), ...(result?.items ?? [])];

  const messages: DirectMessage[] = allRawItems
    .flatMap((row) => {
      const msg = mapDirectMessageRow(row);
      return msg.id ? [msg] : [];
    })
    .sort((a, b) => a.createdAtMs - b.createdAtMs);

  return {
    messages,
    isLoading: result === undefined && enabled,
    hasMore,
    loadingMore,
    loadMore,
  };
}

export function useGetOrCreateConversation() {
  return useMutation(api.directMessages.getOrCreateConversation);
}

export function useSendDirectMessage() {
  return useMutation(api.directMessages.sendMessage);
}

export function useMarkDirectMessageRead() {
  return useMutation(api.directMessages.markAsRead);
}

export function useEditDirectMessage() {
  return useMutation(api.directMessages.editMessage);
}

export function useDeleteDirectMessage() {
  return useMutation(api.directMessages.deleteMessage);
}

export function useToggleDirectMessageReaction() {
  return useMutation(api.directMessages.toggleReaction);
}

export function useArchiveConversation() {
  return useMutation(api.directMessages.setArchiveStatus);
}

export function useMuteConversation() {
  return useMutation(api.directMessages.setMuteStatus);
}

export function useDirectMessageUnreadCount(workspaceId: string | null) {
  const { isPreviewMode } = usePreview();
  const result = useQuery(
    api.directMessages.getUnreadCount,
    !isPreviewMode && workspaceId ? { workspaceId } : 'skip',
  ) as number | undefined;
  return result ?? 0;
}
