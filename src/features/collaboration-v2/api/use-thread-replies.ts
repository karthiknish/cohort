'use client';

import { useQuery, useMutation } from 'convex/react';
import { collaborationApi } from '@/lib/convex-api';
import { usePreview } from '@/shared/contexts/preview-context';
import type { CollaborationMessage } from '../types';
import { mapThreadReplyRow } from '../utils/message-mappers';

type RawListResponse = {
  items: Array<Record<string, unknown>>;
  nextCursor: string | null;
};

export function useThreadReplies(workspaceId: string | null, threadRootId: string | null, limit = 21) {
  const { isPreviewMode } = usePreview();
  const enabled = !isPreviewMode && Boolean(workspaceId) && Boolean(threadRootId);

  const result = useQuery(
    collaborationApi.listThreadReplies,
    enabled ? { workspaceId: String(workspaceId), threadRootId: threadRootId!, limit } : 'skip',
  ) as RawListResponse | undefined;

  const replies: CollaborationMessage[] = (result?.items ?? [])
    .flatMap((row) => {
      const msg = mapThreadReplyRow(row);
      return msg.id ? [msg] : [];
    })
    .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());

  return { replies, isLoading: result === undefined && enabled, hasMore: Boolean(result?.nextCursor) };
}

export function useMarkThreadAsRead() {
  return useMutation(collaborationApi.markThreadAsRead);
}
